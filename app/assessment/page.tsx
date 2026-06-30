'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Suspense } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Section = 'intro' | 'audio-check' | 'warm-up' | 'reading' | 'listening' | 'vocabulary' | 'functional' | 'writing' | 'speaking' | 'result'

type Answer = string | null

interface Result {
  level: 'A2' | 'B1' | 'B2' | 'C1'
  insight: string
  score: number
  maxScore: number
}

// ─── ASSESSMENT DATA ───────────────────────────────────────────────────────────

const items = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: 'Which situation is most common in your role as a senior squad player?',
      question: 'Choose the option that best matches the daily communication reality of the role.',
      options: [
        'A. Preparing detailed physical reports for the medical staff',
        'B. Explaining opposition trends to recruitment staff',
        'C. Understanding coaching instructions during training and matches',
        'D. Designing recovery plans for injured teammates',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'What type of communication matters most to your daily professional performance?',
      question: 'Choose the communication area that most directly affects your performance pathway.',
      options: [
        'A. Understanding coaches clearly in real time',
        'B. Writing long tactical reports after matches',
        'C. Negotiating sponsorship messages with agents',
        'D. Presenting recruitment recommendations to directors',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Tactical Instruction',
      context: 'Your assistant coach sends this message before training:\n\n"Today we work in a mid-block. Stay close to the 6 and protect the inside channel. When the ball goes wide to their fullback, jump with the nearest winger. If the pass stays central, hold your position."',
      question: 'What should you do when the ball goes wide to their fullback?',
      options: [
        'A. Hold the inside channel and avoid pressing wide',
        'B. Wait for the striker before moving forward',
        'C. Drop deeper to protect the penalty area',
        'D. Press with the nearest winger immediately',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Feedback with Reasoning',
      context: 'After training, the analyst sends this note:\n\n"Your positioning was good when we defended crosses. The problem came when the second ball dropped. You reacted a little late, so the opponent could restart the attack. The first step is to scan earlier after the duel."',
      question: 'What is the main improvement target?',
      options: [
        'A. Improve crossing accuracy after defensive duels',
        'B. Scan earlier and react faster to second balls',
        'C. Stay deeper whenever the opponent attacks wide',
        'D. Challenge the first aerial duel with more force',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Physical Status and Availability',
      context: 'Your physiotherapist sends this message:\n\n"Your recovery markers are not alarming, but your hamstring load is higher than normal. I do not think you need to sit out, but we should avoid a full match if we want you ready midweek. Let\'s plan your minutes and monitor intensity."',
      question: 'What is the physiotherapist suggesting?',
      options: [
        'A. You should not train until the midweek fixture',
        'B. You are fully available with no restrictions',
        'C. You can play if minutes and intensity are managed',
        'D. You are injured and unavailable this weekend',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Defensive Instruction',
      script: 'When we lose the ball, stay compact. Do not press alone. Keep close to the midfield line and protect the space inside. Compact first, then pressure.',
      question: 'What is the main instruction?',
      options: [
        'A. Stay compact before pressing the ball',
        'B. Press alone as soon as possession changes',
        'C. Move wide to open the midfield line',
        'D. Attack quickly after every lost ball',
      ],
      correct: 'A',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Pressing Adjustment',
      script: 'Normally we press high straight away. Today, wait for the first pass into midfield. When that pass arrives, close the player down quickly. We press later because they are strong in possession.',
      question: 'How is today\'s pressing approach different?',
      options: [
        'A. Press high as soon as their center-back receives',
        'B. Wait until they enter the attacking third',
        'C. Press after the first pass into midfield',
        'D. Stop pressing and protect the penalty area',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Nuanced Feedback',
      script: 'Your effort was good, and your position improved after halftime. But in the first half, you rushed into tackles too early. The issue is not commitment; it is decision-making. Sometimes controlling the space is better than trying to win the ball immediately.',
      question: 'What does the coach want you to improve?',
      options: [
        'A. Show more commitment in defensive duels',
        'B. Stop tackling and stay away from pressure',
        'C. Hold a deeper position for the full match',
        'D. Control space instead of rushing tackles',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — On-Pitch Warning',
      context: 'You receive the ball facing your own goal. A teammate shouts: "Man on, left shoulder!"',
      question: 'What should you understand?',
      options: [
        'A. A teammate is free on your left side',
        'B. An opponent is close on your left side',
        'C. The ball has gone out on the left side',
        'D. You should pass immediately to the left',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Tactical Term',
      context: 'The coach says: "Our pressing trigger is when their fullback takes the first touch forward."',
      question: 'What is a "pressing trigger"?',
      options: [
        'A. The moment that tells the team to press',
        'B. The player who presses more than others',
        'C. The mistake that happens during pressure',
        'D. The shape used after losing possession',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Medical Precision',
      context: 'The physiotherapist asks: "Can you describe the onset of the discomfort? When did you first notice it, and what movement caused it?"',
      question: 'What is the physiotherapist asking about?',
      options: [
        'A. Whether the discomfort is improving today',
        'B. What treatment you would prefer next',
        'C. When and how the discomfort started',
        'D. Whether you had the same issue before',
      ],
      correct: 'C',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Asking for Clarification',
      context: 'During training, the assistant coach says: "Delay the press in this zone. Force them sideways, and only press when they commit to a direction." You understand most of it, but you are not sure what "commit to a direction" means.',
      question: 'What is the most professional way to ask for clarification?',
      options: [
        'A. "Can you repeat the whole instruction one more time?"',
        'B. "I understand the idea, but the timing feels difficult."',
        'C. "Should I press wider, or stay inside with the 6?"',
        'D. "Can you clarify exactly when they commit to a direction?"',
      ],
      correct: 'D',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Receiving Critical Feedback',
      context: 'At halftime, the head coach says: "Your position was too deep, and you were late to press. We need more from you defensively." You think the team shape also made pressing difficult.',
      question: 'What is the best response?',
      options: [
        'A. "I was working hard, but I\'ll try to follow it more closely."',
        'B. "I see your point. The shape made it hard, but I can press earlier."',
        'C. "I understand. I\'ll press higher every time in the second half."',
        'D. "The shape was the main issue, but I\'ll do what you want."',
      ],
      correct: 'B',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Public Criticism',
      context: 'After a difficult match, a journalist posts: "Poor decision-making from the forwards today. Too many touches and rushed shots." You want to respond professionally online.',
      question: 'Which response best protects your credibility?',
      options: [
        'A. "Disappointed with the result. I\'ll review my decisions and keep working for the team."',
        'B. "Tough result. Some comments are unfair, but we all need to improve quickly."',
        'C. "Not the result we wanted. I gave everything and will ignore outside noise."',
        'D. "Difficult day. The team made mistakes, and we must all take responsibility."',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Role and Playing-Time Conversation',
      context: 'You have had limited minutes recently. You are meeting the head coach privately to understand your role and what you can control.',
      question: 'What is the most strategic way to open the conversation?',
      options: [
        'A. "I want to understand what is missing from my performances and improve it."',
        'B. "I need clarity on whether I am still part of your plans."',
        'C. "I\'d like to understand my role and what I can control to earn more minutes."',
        'D. "I want to know if the minutes are tactical, fitness-related or contractual."',
      ],
      correct: 'C',
    },
  ],
}


const headCoachItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: 'Which situation happens most often in your role as a first-team head coach?',
      question: 'Choose the option that best matches the role’s daily communication reality.',
      options: [
        'A. Preparing individual nutrition plans for injured players',
        'B. Writing detailed scouting reports for recruitment meetings',
        'C. Delivering tactical direction to players and staff',
        'D. Managing academy school partnerships and family meetings',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'What type of communication is most critical for your daily work?',
      question: 'Choose the area that most directly affects your coaching performance pathway.',
      options: [
        'A. Explaining tactical decisions clearly to players and staff',
        'B. Creating public content for club social media channels',
        'C. Negotiating player contracts with agents and lawyers',
        'D. Preparing medical return-to-play documentation',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Defensive Focus',
      context: 'Your assistant coach sends this note before training:\\n\\n"Today we work on our mid-block. Keep the midfield line close to the back four. Do not leave space between the lines. When the ball goes wide, shift together and stay compact."',
      question: 'What is the main defensive focus?',
      options: [
        'A. Press every pass as soon as the opponent receives',
        'B. Protect the penalty area with a very deep line',
        'C. Move the midfield wider to create passing angles',
        'D. Stay compact and protect space between the lines',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Opposition Weakness',
      context: 'The analyst sends this opposition note:\\n\\n"Their fullbacks push high in possession, but the midfield is slow to cover wide spaces. When they lose the ball, there is often a gap behind the fullback. Quick switches can create chances before they recover."',
      question: 'What weakness should the coach identify?',
      options: [
        'A. Their goalkeeper struggles with direct long shots',
        'B. Their wide cover is slow after fullbacks advance',
        'C. Their center-backs are weak in first-contact duels',
        'D. Their strikers stop pressing after losing the ball',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Crisis Management Brief',
      context: 'Internal staff memo:\\n\\n"The last three results have created pressure, but the tactical framework is not the main issue. The data shows the team is reaching good areas, yet execution in both boxes has dropped. The message to the squad must protect belief while making standards non-negotiable."',
      question: 'What message should the coach send internally?',
      options: [
        'A. Keep the tactical framework, address execution and reinforce standards',
        'B. Tell the squad the results are unlucky and avoid criticism',
        'C. Change the tactical model to show immediate action',
        'D. Focus only on motivation and leave analysis for later',
      ],
      correct: 'A',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Midfield Protection',
      script: 'Today we play with three midfielders. The six protects the space in front of the back line. Stay connected. Do not open the middle. Compact, always compact.',
      question: 'What is the main priority for the midfield?',
      options: [
        'A. Push higher to support the striker at every attack',
        'B. Spread out to cover both touchlines quickly',
        'C. Protect the central space in front of defense',
        'D. Drop all midfielders into the penalty area',
      ],
      correct: 'C',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Player Availability Decision',
      script: 'The fitness coach says the player has high fatigue markers. We still need his pressing early because of the opponent’s build-up. So he starts, but we manage the second half and bring him off before seventy if the match allows.',
      question: 'What is the final decision about the player?',
      options: [
        'A. Leave him out so he can fully recover',
        'B. Start him and manage his minutes before seventy',
        'C. Use him only if the team is losing late',
        'D. Play him ninety minutes because he is essential',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Post-Match Leadership',
      script: 'The result hurts, but the performance was closer to what we want. Our pressing energy was good, and the structure was clearer. The second goal came from one poor decision in build-up. Tomorrow we correct that moment without losing the standards we showed.',
      question: 'What is the coach’s core message?',
      options: [
        'A. The defeat proves the tactical structure must change',
        'B. The team should ignore the result and move on',
        'C. One mistake matters more than the whole performance',
        'D. Keep the positives, correct the error and hold standards',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Compactness',
      context: 'During training, the coach says: “The back line and midfield need compactness when we defend.”',
      question: 'What does “compactness” mean here?',
      options: [
        'A. Players stay close enough to protect central spaces',
        'B. Players make short passes to keep possession safely',
        'C. Players move quickly into wide attacking positions',
        'D. Players keep the ball far away from the goalkeeper',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Pressing Trigger',
      context: 'The assistant coach says: “Their pressing trigger is the pass from our goalkeeper to the center-back.”',
      question: 'What is a “pressing trigger”?',
      options: [
        'A. The player who leads the press in every phase',
        'B. The defensive shape used after losing the ball',
        'C. The moment or cue that starts the press',
        'D. The mistake that ends a pressing sequence',
      ],
      correct: 'C',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Squad Availability',
      context: 'The Sporting Director says: “We need to review squad availability across the next three windows before confirming recruitment priorities.”',
      question: 'What does “availability across the next three windows” refer to?',
      options: [
        'A. Media commitments during the next three match weeks',
        'B. Training facility access for future preparation blocks',
        'C. Matchday travel availability for upcoming away fixtures',
        'D. Player status and options in future transfer periods',
      ],
      correct: 'D',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Clear Instruction',
      context: 'A player does not understand the pressing trigger. You have 20 seconds to explain it clearly.',
      question: 'Which explanation is clearest?',
      options: [
        'A. Press with intensity, but don’t lose the team shape.',
        'B. Wait for the pass to the fullback; then close him down.',
        'C. The trigger depends on the opponent’s confidence.',
        'D. Press when you feel the opponent is under pressure.',
      ],
      correct: 'B',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Feedback Under Resistance',
      context: 'During video feedback, a player says: “But the center-back moved late, not me.” You need to keep the conversation productive.',
      question: 'What is the best response?',
      options: [
        'A. You are focusing on the wrong player; watch your position again.',
        'B. The center-back was late, so we will review his clip separately.',
        'C. His timing was late, but your starting position gave you no recovery time.',
        'D. The clip is not about blame; we only need more concentration.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Crisis Media Response',
      context: 'After two losses, a journalist says: “Your defense looks broken. Do you need to change tactics completely?”',
      question: 'Which response is most professional?',
      options: [
        'A. Our defensive structure needs cleaner transition positioning, not a full reset.',
        'B. The defense is not broken; the results make the question sound worse.',
        'C. We will change what is needed, but I won’t discuss the plan today.',
        'D. The players know the issue, and tomorrow they must respond better.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Executive Negotiation',
      context: 'The Sporting Director says: “We need to reduce costs. Can you work with fewer staff members and still compete?”',
      question: 'What is the most strategic response?',
      options: [
        'A. We can reduce some staff, but performance risk will increase.',
        'B. Yes, if everyone accepts more responsibility across departments.',
        'C. I can work with less, but recruitment and analysis must stay untouched.',
        'D. Let’s define acceptable risk first; then I can propose responsible reductions.',
      ],
      correct: 'D',
    },
  ],
}



const assistantCoachItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: 'Which situation happens most often in your work as a first-team assistant coach?',
      question: 'Choose the option that best matches the role’s daily communication reality.',
      options: [
        'A. Managing transfer negotiations with agents',
        'B. Preparing individual recovery plans for players',
        'C. Correcting players during training',
        'D. Leading commercial meetings with sponsors',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'What type of communication is most critical for your daily performance?',
      question: 'Choose the area that most directly affects your assistant-coach pathway.',
      options: [
        'A. Managing public interviews after matches',
        'B. Explaining exercises and correcting technique',
        'C. Writing recruitment reports for directors',
        'D. Setting commercial priorities with sponsors',
      ],
      correct: 'B',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Pressing Instruction',
      context: 'Before training, the head coach sends you this note:\\n\\n"In the first block, focus on the pressing trigger. When the ball arrives to the opposition fullback, the nearest winger presses and the rest of the unit shifts across. Keep the distances short."',
      question: 'What should you emphasize to the players?',
      options: [
        'A. The winger should wait for the center-back to press first.',
        'B. The unit should drop deeper when the fullback receives.',
        'C. The winger presses and the unit shifts together.',
        'D. The team should attack centrally after every recovery.',
      ],
      correct: 'C',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Unit Spacing',
      context: 'After training, the analyst writes:\\n\\n"The first 15 minutes were intense and organized. After that, the front line kept pressing, but the midfield line stopped moving with them. The spaces between units became too big, so the opponent played through us more easily."',
      question: 'What was the main tactical issue after the first 15 minutes?',
      options: [
        'A. The front line stopped pressing after 15 minutes.',
        'B. The unit spacing broke down as fatigue increased.',
        'C. The midfield pressed too aggressively from the start.',
        'D. The opponent created danger only from wide crosses.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Pressing Under Fatigue',
      context: 'The head coach writes:\\n\\n"The players know the pressing shape, but under fatigue they react late after losing the ball. We need them to connect the press with recovery runs: if the first press fails, the second action must protect central space. The issue is not effort; it is recognizing when pressing becomes recovery."',
      question: 'What message should the assistant coach reinforce?',
      options: [
        'A. Keep pressing every loss of possession with maximum intensity.',
        'B. Save energy and stop pressing once the first action fails.',
        'C. Link the press to recovery decisions when fatigue appears.',
        'D. Focus only on the first defensive action after losing it.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Rondo Transition',
      script: 'In the 5v5 rondo, defenders press to win the ball. When you win it, counter quickly into the mini-goal. Press, win, attack. That is the sequence.',
      question: 'What should the defenders do in the drill?',
      options: [
        'A. Keep possession and slow the drill down.',
        'B. Win the ball and attack quickly.',
        'C. Stay passive and protect the middle.',
        'D. Wait for the coach before countering.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Pressing Heights',
      script: 'We will work in three zones today. In the attacking zone, press high. In midfield, press only when the pass is slow. In our defensive zone, stay compact and protect the center.',
      question: 'What is the pressing plan across the three zones?',
      options: [
        'A. Press high in every zone and protect the ball.',
        'B. Press only in midfield and avoid the defensive zone.',
        'C. Press high, then selective midfield press, then compact defending.',
        'D. Stay compact everywhere and avoid pressing high.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Anticipatory Reading',
      script: 'The correction is not just reaction speed. The best players read danger before it fully appears. If the pass is obvious, you are already late. Scan the receiver, the body shape, and the space behind you. Anticipate, then move.',
      question: 'What is the main coaching point?',
      options: [
        'A. React faster only after the opponent has received.',
        'B. Read danger early by scanning cues before the pass.',
        'C. Stay deeper so you never need to anticipate.',
        'D. Focus on speed more than tactical information.',
      ],
      correct: 'B',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Rondo',
      context: 'During training, the head coach says: “Start with a 5v5 rondo. Keep the ball moving and protect the central player.”',
      question: 'What is a “rondo” in this context?',
      options: [
        'A. A fitness drill focused on long sprint intervals.',
        'B. A video meeting reviewing pressing clips.',
        'C. A small-sided possession drill in limited space.',
        'D. A defensive shape used near the penalty area.',
      ],
      correct: 'C',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Body Scanning',
      context: 'During a passing exercise, you tell a player: “Scan before you receive. Check your shoulder before the ball arrives.”',
      question: 'What does “body scanning” mean here?',
      options: [
        'A. Protecting body position in physical duels.',
        'B. Checking around before receiving the ball.',
        'C. Measuring sprint speed after training.',
        'D. Watching only the ball during possession.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Numerical Overload',
      context: 'The analyst says: “We can create a numerical overload on the left side if the fullback steps inside and the winger holds the width.”',
      question: 'What does “numerical overload” mean?',
      options: [
        'A. Playing with fewer touches under pressure.',
        'B. Creating width with both fullbacks.',
        'C. Having more players than the opponent in an area.',
        'D. Moving the defensive line higher than usual.',
      ],
      correct: 'C',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Pressing Trigger Explanation',
      context: 'A player asks: “When exactly should I start the press?” You need to explain the trigger quickly before the next repetition.',
      question: 'Which explanation is clearest?',
      options: [
        'A. Press when you feel the fullback is unsure.',
        'B. Press every time the ball moves to the side.',
        'C. Wait until the striker decides to go first.',
        'D. Press when the fullback receives facing our goal.',
      ],
      correct: 'D',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Repetition Under Fatigue',
      context: 'A player is frustrated because the pressing drill keeps repeating. He says: “We already understand this. Why are we doing it again?”',
      question: 'What is the best response?',
      options: [
        'A. You are tired because you did not concentrate enough.',
        'B. We can stop the exercise if the group understands it.',
        'C. Repetition makes the reaction automatic under match fatigue.',
        'D. The head coach wants more repetitions, so we continue.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Supporting a Confused Player',
      context: 'A player looks confused after being corrected for a late pressing action. You need to make the feedback usable without overwhelming him.',
      question: 'Which response gives the clearest support?',
      options: [
        'A. Your position was fine, but your next action needs more intensity.',
        'B. Your position was right. The timing was late. Move earlier as the pass travels.',
        'C. You understood the idea, but the recovery run must be more aggressive.',
        'D. The coach wants more speed, so focus mainly on pressing harder.',
      ],
      correct: 'B',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Translating Tactical Intention',
      context: 'The head coach tells a midfielder: “I need you to think, not just react.” The player looks unsure. You need to translate the idea into a clear action.',
      question: 'What is the most useful clarification?',
      options: [
        'A. Press quicker and stop waiting for the play to develop.',
        'B. Stay calmer and make fewer emotional decisions.',
        'C. Take more time before passing so the safe option appears.',
        'D. Scan before receiving so you see two options before the ball arrives.',
      ],
      correct: 'D',
    },
  ],
}



const academyDirectorItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: 'Which situation is most common in your role as an academy director?',
      question: 'Choose the option that best matches the daily communication reality of the role.',
      options: [
        'A. Delivering individual tactical feedback to senior first-team players',
        'B. Aligning academy staff around development philosophy and standards',
        'C. Designing weekly recovery loads for youth players',
        'D. Negotiating senior player contracts with agents',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'What type of communication demands the most time in your role?',
      question: 'Choose the communication area that most directly affects your academy leadership pathway.',
      options: [
        'A. Managing public messages after first-team match results',
        'B. Writing physical reports for each academy age group',
        'C. Delivering daily technical corrections on the pitch',
        'D. Coordinating academy, first team, staff and families',
      ],
      correct: 'D',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Academy Group Update',
      context: 'You receive this academy update:\\n\\n"The U17 group has 18 players this month. Three players have met the criteria to progress to U19 training next month. The rest will continue with the same development plan."',
      question: 'What will happen to three U17 players next month?',
      options: [
        'A. They will progress to U19 training.',
        'B. They will join the first team immediately.',
        'C. They will move into injury recovery.',
        'D. They will repeat the full U17 cycle.',
      ],
      correct: 'A',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Player Progress Review',
      context: 'A coach sends this note about a U16 midfielder:\\n\\n"Technically, he is one of the strongest players in the group. However, his attitude has been inconsistent, especially when sessions become demanding. This is not a quality issue; it is a maturity and focus issue."',
      question: 'What is the main development concern?',
      options: [
        'A. His technical quality is below the group standard.',
        'B. His physical speed is not ready for promotion.',
        'C. His attitude, focus and maturity need improvement.',
        'D. His tactical role should change before the next review.',
      ],
      correct: 'C',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — First-Team Pathway Decision',
      context: 'The first team wants to use a U18 striker immediately because of injuries. Academy staff believe the player is talented but not ready for senior pressure. A short second-team loan is proposed so he can play competitive minutes while staying in a protected development environment.',
      question: 'What does this solution mainly achieve?',
      options: [
        'A. It blocks promotion because academy standards matter most.',
        'B. It balances first-team need with long-term development.',
        'C. It moves the player directly into senior competition.',
        'D. It removes academy responsibility for the decision.',
      ],
      correct: 'B',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Academy Status Update',
      script: 'The academy has 50 players across five age groups. The U16 group is strong, with eight players showing good potential. The main need this month is a new goalkeeper coach for the U15 group.',
      question: 'What specific resource need is mentioned?',
      options: [
        'A. More U16 midfielders for next season',
        'B. A performance analyst for the U17 group',
        'C. Extra first-team training slots for U18',
        'D. A goalkeeper coach for the U15 group',
      ],
      correct: 'D',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Recruitment Criteria Change',
      script: 'The first team is changing to a 4-2-3-1. That means our academy needs midfielders who can adapt to different roles. We should update the recruitment criteria for the next U14 intake immediately.',
      question: 'What should change in recruitment?',
      options: [
        'A. Recruit midfielders who can adapt to different roles.',
        'B. Select only attacking players for the next intake.',
        'C. Keep recruitment criteria unchanged this season.',
        'D. Promote current U14 players directly to U18.',
      ],
      correct: 'A',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Parent Expectation Management',
      script: 'The parent says his son should move up because he is bigger and faster than most U17 players. But bigger is not always better. We assess readiness, not just physical advantage. If we lower the standard now, we may waste a year of real development.',
      question: 'What is the main message?',
      options: [
        'A. Physical advantage should decide promotion timing.',
        'B. Parent satisfaction should guide pathway decisions.',
        'C. Readiness standards protect long-term development.',
        'D. Stronger players should always train with older groups.',
      ],
      correct: 'C',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Competency Framework',
      context: 'A new coach asks about the academy competency framework. You explain that it shows what players must demonstrate at each stage.',
      question: 'What does "competency framework" mean here?',
      options: [
        'A. A list of academy matches and seasonal results',
        'B. A clear standard of what players must demonstrate',
        'C. A report showing only physical testing scores',
        'D. A schedule for moving players between groups',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Pathway Mapping',
      context: 'In a family meeting, you say: "We use pathway mapping to show how a player can move from youth development toward first-team readiness."',
      question: 'What does "pathway mapping" refer to?',
      options: [
        'A. A map of academy training facilities',
        'B. A list of players selected for the next match',
        'C. A ranking of players by technical potential',
        'D. A plan showing development stages toward first team',
      ],
      correct: 'D',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Academy ROI Metrics',
      context: 'The board asks about academy ROI metrics: first-team progressions, player value, transfer potential and club reputation.',
      question: 'What are "academy ROI metrics" measuring?',
      options: [
        'A. Development impact through progressions, value and reputation',
        'B. Daily training attendance across all age groups',
        'C. Player happiness and family satisfaction only',
        'D. Facility maintenance costs across the academy',
      ],
      correct: 'A',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Academy Standards',
      context: 'A new academy coach asks how strict discipline should be with younger players. You want to protect standards without treating youth players like senior professionals.',
      question: 'What is the best response?',
      options: [
        'A. "Keep discipline strict; if standards drop, players should lose minutes."',
        'B. "Be flexible with discipline because young players need freedom to learn."',
        'C. "Use professional standards in age-appropriate ways. Discipline teaches responsibility."',
        'D. "Leave discipline to senior staff so coaches can focus on technical work."',
      ],
      correct: 'C',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Parent Expectation',
      context: 'A parent says their son is special and should definitely stay in the academy. You see potential, but the next decision depends on focus, consistency and maturity.',
      question: 'Which response is most professional?',
      options: [
        'A. "Your son is talented, so we can promise another long-term academy cycle."',
        'B. "We see potential, but focus and consistency must improve before we reassess."',
        'C. "He is not ready, and staying longer will not change the decision."',
        'D. "Physical talent is enough for now; attitude can develop later."',
      ],
      correct: 'B',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Fast-Track Pressure',
      context: 'The Sporting Director wants to fast-track an academy striker because the first team needs depth. You believe immediate promotion would break the development model.',
      question: 'What is the strongest response?',
      options: [
        'A. "I understand the need. A short second-team loan gives minutes while protecting the pathway."',
        'B. "Move him up now; first-team pressure will show if he can handle the level."',
        'C. "Keep him in U18 only; the model should not adapt to first-team needs."',
        'D. "Ask the player what he prefers and make the pathway fit that choice."',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Academy Philosophy Shift',
      context: 'You are introducing a new academy philosophy to coaches, parents and leadership. The philosophy changes the definition of success from fast promotion to first-team readiness.',
      question: 'What is the most strategic message?',
      options: [
        'A. "We are changing the model because faster promotion is now the main measure of success."',
        'B. "The new philosophy keeps standards flexible so more players can move up early."',
        'C. "This change is mainly about improving match results in the short term."',
        'D. "We are redefining success: not faster promotion, but better preparation for first-team demands."',
      ],
      correct: 'D',
    },
  ],
}



const headOfScoutingItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Communication Focus',
      context: 'You are completing the FEI diagnostic for the Head of Scouting — Recruitment Leadership role.',
      question: 'Which communication situation is most central to your role?',
      options: [
        'A. Delivering daily tactical instructions to first-team players.',
        'B. Aligning scouts around recruitment philosophy and criteria.',
        'C. Managing player recovery plans with medical staff.',
        'D. Creating social media content for transfer announcements.',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'The diagnostic personalizes the pathway based on your main communication demand.',
      question: 'Which communication task is most important in your daily work?',
      options: [
        'A. Translating tactical needs into clear recruitment profiles.',
        'B. Explaining warm-up exercises to first-team players.',
        'C. Reporting nutrition plans to the performance department.',
        'D. Preparing matchday media quotes for the head coach.',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Recruitment Priority Update',
      context: 'Recruitment update:\\n\\n"Q3 focus: centre-backs, fullbacks and 8/10 midfielders. Priority profile: centre-back. Italian league coverage remains active."',
      question: 'Which profile is the current priority?',
      options: [
        'A. Fullbacks with attacking output.',
        'B. 8/10 midfielders from Italy.',
        'C. Any player from the Italian league.',
        'D. Centre-backs for the recruitment list.',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Vague Scout Report',
      context: 'A scout writes: “He is a dynamic midfielder.” You ask for clarification: pressing intensity, box runs, decision speed or ball progression?',
      question: 'What is the main weakness in the scout’s wording?',
      options: [
        'A. It gives too much technical detail too early.',
        'B. It lacks specific evidence about the player’s qualities.',
        'C. It focuses too much on physical performance.',
        'D. It already contains a complete recruitment profile.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Best Available vs Best Fit',
      context: 'The board asks for the “best available” player. The Sporting Director says the club needs the “best fit at the best price.” The recruitment team must clarify the decision criteria before presenting recommendations.',
      question: 'What is the key issue?',
      options: [
        'A. The board wants to cancel the recruitment process.',
        'B. The recruitment team has already chosen the player.',
        'C. There is tension between reputation, fit and value.',
        'D. The Sporting Director wants to avoid all spending.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Scouting Network Update',
      script: 'We have 12 scouts covering six countries. This quarter we completed 240 observations, created an 18-player shortlist and made three formal recommendations.',
      question: 'How many formal recommendations were made?',
      options: [
        'A. Three formal recommendations.',
        'B. Six formal recommendations.',
        'C. Twelve formal recommendations.',
        'D. Eighteen formal recommendations.',
      ],
      correct: 'A',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Two Recruitment Strategies',
      script: 'The European scout recommends a proven 28-year-old. The South American scout recommends a 21-year-old with potential. With a €15M budget, we should explore both, but they represent different strategies.',
      question: 'What is the final direction?',
      options: [
        'A. Choose only the older proven player.',
        'B. Choose only the younger potential player.',
        'C. Explore both profiles because they serve different strategies.',
        'D. Delay all recruitment because the budget is too small.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Urgent Market Opportunity',
      script: 'An agent says there is a 48-hour opportunity at €18M. Normal market price is closer to €25M. The risk is rushing; the opportunity is value. Our role is to present the case and facilitate the decision.',
      question: 'What should the Head of Scouting do?',
      options: [
        'A. Reject the opportunity because 48 hours is too short.',
        'B. Accept the deal immediately before the price rises.',
        'C. Ask the agent to make the decision for the club.',
        'D. Frame the risk and value so leadership can decide.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Recruitment Profile',
      context: 'The Sporting Director says: “We need a clear recruitment profile before assigning scouts.”',
      question: 'What is a recruitment profile?',
      options: [
        'A. A player’s social media and public image.',
        'B. The specific criteria for the position and role.',
        'C. The final contract offered to the player.',
        'D. A list of previous clubs and agents.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Transfer Window Strategy',
      context: 'The recruitment department reviews its transfer window strategy before January.',
      question: 'What does this mean?',
      options: [
        'A. The travel schedule for scouts during the season.',
        'B. The press plan for announcing new signings.',
        'C. The training plan for integrating new players.',
        'D. The planned recruitment approach for a market period.',
      ],
      correct: 'D',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Market Intelligence',
      context: 'A report says: “Market intelligence suggests two competitors are moving early, and availability may change after the window opens.”',
      question: 'What does market intelligence refer to here?',
      options: [
        'A. Information on availability, pricing and competitor activity.',
        'B. A player’s ability to understand tactical instructions.',
        'C. A list of public transfer rumors from media sources only.',
        'D. The financial report from the club’s accounting team.',
      ],
      correct: 'A',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Briefing a New Scout',
      context: 'A new scout asks how to prioritize reports for your department. You want to communicate the recruitment philosophy clearly.',
      question: 'Which response is most appropriate?',
      options: [
        'A. Write reports the way you prefer, as long as the player looks interesting.',
        'B. Focus mainly on technical quality; price and role fit come later.',
        'C. We value fit, cost and evidence. Reports must connect players to our profiles.',
        'D. Send every good player to the shortlist and we will decide centrally.',
      ],
      correct: 'C',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Scout Disagrees with Priority',
      context: 'A senior scout argues that striker depth is urgent, but your current strategic priority is midfield depth.',
      question: 'Which response best maintains alignment?',
      options: [
        'A. Striker depth is not part of this window, so stop monitoring that area.',
        'B. I understand the concern; keep monitoring strikers, but midfield remains priority this window.',
        'C. You may be right, so we should change the priority immediately.',
        'D. Both areas are equally important, so submit recommendations for both.',
      ],
      correct: 'B',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Unrealistic Coach Request',
      context: 'The head coach wants a proven goalscorer, but the market price is far above the approved budget.',
      question: 'Which response is strongest?',
      options: [
        'A. The profile is valid, but the current budget requires alternatives or a longer timeline.',
        'B. The coach’s request is unrealistic, so recruitment should ignore it.',
        'C. We should ask finance to increase the budget before scouting anyone.',
        'D. A cheaper player will solve the problem if we act quickly enough.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Board Skepticism',
      context: 'The board questions your recruitment strategy because it produces fewer headline signings. You need to defend the long-term approach.',
      question: 'Which response is most strategic?',
      options: [
        'A. Headline signings are not our model, so the board needs patience.',
        'B. The strategy is cheaper, and that should be enough justification.',
        'C. We can change the strategy if the board wants faster visibility.',
        'D. The model trades headlines for fit, depth and sustainable squad value.',
      ],
      correct: 'D',
    },
  ],
}



const scoutItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Context',
      context: 'You are completing the FEI diagnostic for the Scout — First Team Recruitment role.',
      question: 'Which situation is most central to your scouting role?',
      options: [
        'A. Preparing player recovery plans after training.',
        'B. Coaching tactical exercises with the first team.',
        'C. Observing players live and writing evaluation reports.',
        'D. Negotiating contract terms with player agents.',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'The assessment personalizes the pathway based on your main communication need.',
      question: 'Which communication task is most important in your daily work?',
      options: [
        'A. Communicating player evaluations and recruitment recommendations.',
        'B. Creating social media content after matches.',
        'C. Explaining recovery protocols to injured players.',
        'D. Presenting nutrition plans to the performance staff.',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Short Player Note',
      context: 'A scout writes this quick note after watching a winger:\\n\\n"Quick and technical. Good first touch. Weak pressing. Inconsistent across both halves."',
      question: 'Which area is clearly identified as a weakness?',
      options: [
        'A. The player lacks technical ability on the ball.',
        'B. The player has a poor first touch under pressure.',
        'C. The player is slow and physically limited.',
        'D. The player’s pressing and consistency need attention.',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Recruitment Monitoring Note',
      context: 'Internal scouting note:\\n\\n"We have observed this player for six months. He had an excellent U21 season and his market value is rising. Two other clubs are now monitoring him. Recommendation: advance to negotiation before the price increases."',
      question: 'What is the main recommendation?',
      options: [
        'A. Monitor the player for another full season.',
        'B. Move toward negotiation before the market changes.',
        'C. Reject the player because other clubs are interested.',
        'D. Wait until his value becomes more stable.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Recruitment Reality Check',
      context: 'The head coach wants a proven 25–30-year-old goalscorer. The market price for that profile is over €40M, but the available budget is €15M. The recruitment team is considering an U23 forward with high potential and lower cost.',
      question: 'What is the main communication issue?',
      options: [
        'A. The requested profile and available budget are not aligned.',
        'B. The recruitment team should ignore the coach’s request.',
        'C. The club must spend over budget to compete.',
        'D. The U23 profile has already proven first-team output.',
      ],
      correct: 'A',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Basic Player Profile',
      script: 'The player is 23 years old, a left winger. Technically he is strong, and his speed is very good. His attitude is sometimes unfocused, but physically he can handle the league.',
      question: 'Which two strengths are mentioned?',
      options: [
        'A. Leadership and finishing.',
        'B. Attitude and tactical discipline.',
        'C. Technical level and speed.',
        'D. Pressing and defensive positioning.',
      ],
      correct: 'C',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Comparing Three Strikers',
      script: 'Profile A is technical and links play well, but less physical. Profile B is strong and direct, but slower. Profile C is balanced, but less proven. For our 4-2-3-1, the technical connection is the priority.',
      question: 'Which profile best fits the system?',
      options: [
        'A. Profile B, because physical power is the only priority.',
        'B. Profile C, because balance matters more than role fit.',
        'C. No profile fits because all have weaknesses.',
        'D. Profile A, because technical link play is the priority.',
      ],
      correct: 'D',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Form or Development?',
      script: 'We have tracked him for 18 months. Last season he scored 8 goals in 30 matches. This season he has 15 in 20. The question is whether this is genuine improvement or temporary form. We need video evidence of decision-making, not only goals.',
      question: 'What is the main scouting question?',
      options: [
        'A. Whether the player is old enough for the first team.',
        'B. Whether the improvement is sustainable or just current form.',
        'C. Whether goal numbers are the only recruitment evidence needed.',
        'D. Whether the player should be signed immediately.',
      ],
      correct: 'B',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Market Value',
      context: 'A recruitment update says: “His market value is currently around €12M.”',
      question: 'What does “market value” mean here?',
      options: [
        'A. The player’s weekly salary expectation.',
        'B. The number of clubs watching the player.',
        'C. The amount the club spends on scouting travel.',
        'D. The estimated transfer price of the player.',
      ],
      correct: 'D',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Scouting Pipeline',
      context: 'The Head of Recruitment asks: “Where is this player in our scouting pipeline?”',
      question: 'What does “scouting pipeline” mean?',
      options: [
        'A. The process from observation to evaluation and decision.',
        'B. A list of players already signed by the club.',
        'C. The travel schedule for live match observations.',
        'D. A medical report used before contract signing.',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Sell-On Clause',
      context: 'A report says: “The selling club wants a 20% sell-on clause.”',
      question: 'What is a sell-on clause?',
      options: [
        'A. A bonus paid if the player scores 20 goals.',
        'B. A condition that cancels the transfer later.',
        'C. A percentage owed from a future transfer profit.',
        'D. A salary increase after the first season.',
      ],
      correct: 'C',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Defending a Recommendation',
      context: 'You recommend monitoring a midfielder for one more month. The Head of Recruitment asks why you do not want to decide now.',
      question: 'Which response is most professional?',
      options: [
        'A. He is probably good enough, but I am not fully sure yet.',
        'B. His metrics are improving, but one more month gives us better evidence.',
        'C. I prefer to wait because another scout also likes him.',
        'D. We should delay because the market is difficult right now.',
      ],
      correct: 'B',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Comparing Two Profiles',
      context: 'You are comparing two forwards. Player A is more developed and ready now. Player B has a higher ceiling but needs time. The Sporting Director asks for your view.',
      question: 'Which response best communicates the comparison?',
      options: [
        'A. Player A is safer, so we should ignore Player B for now.',
        'B. Player B is more exciting, so he should be the priority.',
        'C. Both profiles are useful, but we cannot compare them directly.',
        'D. A gives short-term impact; B is a longer-term investment.',
      ],
      correct: 'D',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Challenging Inflated Language',
      context: 'Another scout writes: “This player is world class.” You think the report is too vague.',
      question: 'What is the best follow-up?',
      options: [
        'A. What specific actions show world-class level compared with alternatives?',
        'B. I disagree. The player is clearly not world class yet.',
        'C. World class is too strong; please rewrite the report more simply.',
        'D. Let’s keep the phrase if the player looked impressive live.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Board Challenge',
      context: 'The board questions an €8M recommendation for a young forward. They say the profile is risky because he is not proven.',
      question: 'Which response is strongest strategically?',
      options: [
        'A. The player is young, so we should accept that some risk exists.',
        'B. If the board wants proven output, we need to spend more money.',
        'C. The risk is real, but the fee, ceiling and clauses make it manageable.',
        'D. We should only sign him if the head coach personally approves it.',
      ],
      correct: 'C',
    },
  ],
}


const insights = {
  A2: {
    level: 'A2',
    title: 'Foundation',
    insight: 'You understand basic football communication situations and can follow direct instructions. Your pathway will help you build confidence and clarity in more complex professional contexts. Training focus: Understanding tactical instructions; asking for clarification; reporting physical status; responding to basic feedback. Every lesson connects directly to your professional role.',
  },
  B1: {
    level: 'B1',
    title: 'Intermediate',
    insight: 'You already understand many common football communication situations and can respond professionally in routine interactions. Your pathway will help you communicate with more confidence, structure and precision in complex situations. Training focus: Tactical clarification; feedback response; medical communication; speaking with confidence under pressure. Every lesson connects directly to your professional role.',
  },
  B2: {
    level: 'B2',
    title: 'Professional',
    insight: 'You communicate with clarity and professionalism across most football situations. Your pathway will help you manage more complex conversations, pressure moments and leadership communication with stronger strategic control. Training focus: Complex feedback conversations; playing-time and role discussions; public communication; leadership communication under pressure. Every lesson connects directly to your professional role.',
  },
  C1: {
    level: 'C1',
    title: 'Advanced Professional',
    insight: 'You demonstrate advanced professional communication with precision, maturity and strategic awareness. Your pathway will help you refine leadership communication, negotiation, public presence and high-pressure decision-making. Training focus: Advanced leadership communication; strategic negotiation; crisis and media communication; personal brand and reputation management. Every lesson connects directly to your professional role.',
  },
}

// ─── SCORE CALCULATOR ────────────────────────────────────────────────────────

function calculateResult(assessmentItems: typeof items, answers: Record<string, Answer>, writingScore: number, speakingScore: number): Result {
  let score = 0
  const maxObjective = 13
  const allItems = [...assessmentItems.reading, ...assessmentItems.listening, ...assessmentItems.vocabulary, ...assessmentItems.functional]

  allItems.forEach((item) => {
    const ans = answers[item.id]
    if (ans && ans.startsWith(item.correct)) score++
  })

  const totalScore = score + writingScore + speakingScore
  const maxScore = maxObjective + 4 + 4

  const a2Items = [assessmentItems.reading[0], assessmentItems.listening[0], assessmentItems.vocabulary[0]]
  const b1Items = [assessmentItems.reading[1], assessmentItems.listening[1], assessmentItems.vocabulary[1], assessmentItems.functional[0]]
  const b2Items = [assessmentItems.reading[2], assessmentItems.listening[2], assessmentItems.vocabulary[2], assessmentItems.functional[1], assessmentItems.functional[2]]
  const c1Item = assessmentItems.functional[3]

  const a2Score = a2Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const b1Score = b1Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const b2Score = b2Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const c1Correct = answers[c1Item.id]?.startsWith(c1Item.correct)

  let level: 'A2' | 'B1' | 'B2' | 'C1' = 'A2'

  if (c1Correct && b2Score >= 4 && (writingScore === 4 || speakingScore === 4)) {
    level = 'C1'
  } else if (b2Score >= 3 && b1Score >= 3) {
    level = 'B2'
  } else if (b1Score >= 3 && a2Score >= 2) {
    level = 'B1'
  } else {
    level = 'A2'
  }

  return {
    level,
    insight: insights[level].insight,
    score: totalScore,
    maxScore,
  }
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-fei-text/40">
        <span>Item {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-fei-text/10">
        <div
          className="h-1.5 rounded-full bg-fei-yellow transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-fei-sky/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">
      {label}
    </span>
  )
}

function OptionButton({
  option,
  selected,
  onSelect,
}: {
  option: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-sm leading-6 transition ${
        selected
          ? 'border-fei-yellow bg-fei-yellow/[0.07] text-fei-text shadow-[0_0_0_1px_rgba(255,214,10,0.12)]'
          : 'border-fei-text/10 bg-fei-text/[0.03] text-fei-text/70 hover:border-fei-sky/35 hover:bg-fei-sky/[0.035] hover:text-fei-text'
      }`}
    >
      <span className="font-medium">{option}</span>
    </button>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function AudioPlayer({ script, itemId }: { script: string; itemId: string }) {
  const [played, setPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)

  function handlePlay() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => { setPlaying(true); setPlayed(true) }
    utterance.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="rounded-xl border border-fei-sky/20 bg-fei-sky/[0.04] p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-fei-sky" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Audio</span>
        {played && <span className="text-xs text-fei-sky/60">— You can listen again</span>}
      </div>
      <p className="mb-4 text-xs text-fei-text/40 italic">Click play to hear the audio clip. You may listen up to 2 times.</p>
      <button
        onClick={handlePlay}
        disabled={playing}
        className="inline-flex items-center gap-2 rounded-full bg-fei-sky px-5 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-sky/90 disabled:opacity-50"
      >
        {playing ? (
          <>
            <span className="flex h-3 w-3 items-center gap-0.5">
              <span className="block h-3 w-0.5 animate-pulse bg-fei-bg" />
              <span className="block h-2 w-0.5 animate-pulse bg-fei-bg" style={{ animationDelay: '0.1s' }} />
              <span className="block h-3 w-0.5 animate-pulse bg-fei-bg" style={{ animationDelay: '0.2s' }} />
            </span>
            Playing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
            {played ? 'Play again' : 'Play audio'}
          </>
        )}
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const selectedRole = searchParams.get('role') || 'Professional Player'
  const assessmentAvailable = selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Academy Director' || selectedRole === 'Head of Scouting' || selectedRole === 'Scout'
  const activeItems = selectedRole === 'Head Coach' ? headCoachItems : selectedRole === 'Assistant Coach' ? assistantCoachItems : selectedRole === 'Academy Director' ? academyDirectorItems : selectedRole === 'Head of Scouting' ? headOfScoutingItems : selectedRole === 'Scout' ? scoutItems : items
  const roleSubtitle = selectedRole === 'Academy Director' ? 'Youth & Academy' : selectedRole === 'Head of Scouting' ? 'Recruitment Leadership' : selectedRole === 'Scout' ? 'First Team Recruitment' : selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' ? 'First Team' : 'Senior Squad'

  const [section, setSection] = useState<Section>('intro')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [warmupStep, setWarmupStep] = useState(0)
  const [readingStep, setReadingStep] = useState(0)
  const [listeningStep, setListeningStep] = useState(0)
  const [vocabStep, setVocabStep] = useState(0)
  const [functionalStep, setFunctionalStep] = useState(0)
  const [writingText, setWritingText] = useState('')
  const [writingScore, setWritingScore] = useState(0)
  const [speakingScore, setSpeakingScore] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingDone, setRecordingDone] = useState(false)
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [audioTestPlaying, setAudioTestPlaying] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [saving, setSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const totalItems = 17

  // ── Security: block navigation ───────────────────────────────────────────────
  useEffect(() => {
    if (section === 'intro' || section === 'result') return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [section])

  // ── Security: disable copy/paste/right-click ──────────────────────────────────
  useEffect(() => {
    if (section === 'intro' || section === 'result') return

    function prevent(e: Event) { e.preventDefault() }

    document.addEventListener('copy', prevent)
    document.addEventListener('cut', prevent)
    document.addEventListener('contextmenu', prevent)

    return () => {
      document.removeEventListener('copy', prevent)
      document.removeEventListener('cut', prevent)
      document.removeEventListener('contextmenu', prevent)
    }
  }, [section])

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function scoreWriting(text: string): number {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim().split(/[.!?]+/).filter(Boolean).length
    const lower = text.toLowerCase()

    const professionalPlayerKeywords = ['hamstring', 'sharp', 'turn', 'cool-down', 'sprint', 'tight']
    const headCoachKeywords = ['press', 'pressure', 'plan', 'space', 'calm', 'width', 'standards', 'discipline', 'belief']
    const assistantCoachKeywords = ['press', 'pressing', 'spacing', 'timing', 'fatigue', 'repetition', 'compactness', 'structure', 'focus']
    const academyDirectorKeywords = ['academy', 'readiness', 'standards', 'development', 'pathway', 'u16', 'progress', 'consistency', 'first-team']
    const headOfScoutingKeywords = ['recruitment', 'profile', 'market', 'shortlist', 'budget', 'strategy', 'scouts', 'fit', 'value', 'q4']
    const scoutKeywords = ['scout', 'scouting', 'player', 'technical', 'fit', 'risk', 'monitoring', 'market', 'value', 'recommendation']

    const keywords =
      selectedRole === 'Head Coach'
        ? headCoachKeywords
        : selectedRole === 'Assistant Coach'
          ? assistantCoachKeywords
          : selectedRole === 'Academy Director'
            ? academyDirectorKeywords
            : selectedRole === 'Head of Scouting'
              ? headOfScoutingKeywords
              : selectedRole === 'Scout'
                ? scoutKeywords
                : professionalPlayerKeywords

    const hasKey = keywords.some((w) => lower.includes(w))

    if (words < 20 || sentences < 2) return 1
    if (words >= 20 && sentences >= 3 && !hasKey) return 2
    if (words >= 35 && sentences >= 3 && hasKey) return 3
    return 4
  }

  async function finishAssessment(spScore: number) {
    const wScore = scoreWriting(writingText)
    const res = calculateResult(activeItems, answers, wScore, spScore)
    setResult(res)
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('assessment_history').insert({
        user_id: user.id,
        role: selectedRole,
        score: Math.round((res.score / res.maxScore) * 100),
        level: res.level,
        completed_at: new Date().toISOString(),
      })
    }

    setSaving(false)
    setSection('result')
  }

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
    }
  }

  function playAudioTest() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance('Audio test. If you can hear this clearly, your audio is working correctly.')
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => setAudioTestPlaying(true)
    utterance.onend = () => setAudioTestPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  async function startRecording() {
    try {
      let stream = mediaStreamRef.current

      if (!stream || stream.getTracks().every((track) => track.readyState === 'ended')) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setMicPermission('granted')
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 75) {
            stopRecording()
            return t
          }
          return t + 1
        })
      }, 1000)
    } catch {
      setMicPermission('denied')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setRecordingDone(true)
  }

  function getItemNumber(section: Section, step: number): number {
    const map: Record<string, number> = {
      'warm-up': step + 1,
      'reading': step + 3,
      'listening': step + 6,
      'vocabulary': step + 9,
      'functional': step + 12,
      'writing': 16,
      'speaking': 17,
    }
    return map[section] || 1
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }, [])

  // ─── SCREENS ────────────────────────────────────────────────────────────────

  if (!assessmentAvailable) {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] text-fei-yellow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="8.5" />
              </svg>
            </div>

            <div className="mb-4 inline-block rounded-full bg-fei-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
              Assessment Coming Soon
            </div>

            <h1 className="text-3xl font-black text-fei-text">{selectedRole}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-fei-text/60">
              This role-specific diagnostic is being prepared. FEI diagnostics are built separately for each football role so the questions, scenarios, and pathway recommendation match your real communication context.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-8 rounded-full bg-fei-yellow px-8 py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // INTRO
  if (section === 'intro') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8">
            <div className="inline-block rounded-full bg-fei-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
              Diagnostic Assessment
            </div>
            <h1 className="mt-4 text-4xl font-black text-fei-text sm:text-5xl">{selectedRole}</h1>
            <p className="mt-3 text-fei-text/60">{roleSubtitle} · FEI Communication Intelligence</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-fei-sky/20 bg-fei-sky/[0.08] text-fei-sky">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5v5l3 2" />
                </svg>
              </div>
              <p className="text-xs text-fei-text/50">Duration</p>
              <p className="mt-1 font-semibold text-fei-text">10–12 minutes</p>
            </div>

            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] text-fei-yellow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M12 3.5 19 7.5v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8v-5l7-4Z" />
                  <path d="M9 12.5 11 14.5 15.5 9.5" />
                </svg>
              </div>
              <p className="text-xs text-fei-text/50">Result</p>
              <p className="mt-1 font-semibold text-fei-text">FEI Pathway + AI Insight</p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="mb-4 font-bold text-fei-text">Before you begin</h2>
            <ul className="space-y-4 text-sm text-fei-text/70">
              {[
                'Use headphones or speakers for listening items.',
                'Enable your microphone for the final spoken response.',
                'Stay on this page until the assessment is complete.',
                'Find a quiet place with a stable internet connection.',
                'Answer every item. There is no penalty for incorrect answers.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-fei-yellow/25 bg-fei-yellow/[0.08] text-fei-yellow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                      aria-hidden
                    >
                      <path d="m6 12 4 4 8-8" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setSection('audio-check')}
            className="w-full rounded-full bg-fei-yellow py-4 text-base font-bold text-fei-bg transition hover:bg-fei-yellow/90"
          >
            <span className="inline-flex items-center justify-center gap-2">
              Begin assessment
              <ChevronRightIcon />
            </span>
          </button>
        </div>
      </div>
    )
  }

  // AUDIO CHECK
  if (section === 'audio-check') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8">
            <div className="inline-block rounded-full bg-fei-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
              Audio & Microphone Check
            </div>
            <h1 className="mt-4 text-3xl font-black text-fei-text">Check your setup</h1>
            <p className="mt-2 text-fei-text/60">Check your audio and enable your microphone before starting the diagnostic.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky font-bold text-sm">1</div>
                <h3 className="font-bold text-fei-text">Audio test</h3>
              </div>
              <p className="mb-4 text-sm text-fei-text/60">Play the sample audio to confirm you can hear the listening items.</p>
              <button
                onClick={playAudioTest}
                disabled={audioTestPlaying}
                className="inline-flex items-center gap-2 rounded-full border border-fei-sky px-5 py-2.5 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10 disabled:opacity-50"
              >
                {audioTestPlaying ? 'Playing...' : 'Play test audio'}
              </button>
            </div>

            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky font-bold text-sm">2</div>
                <h3 className="font-bold text-fei-text">Speaking setup</h3>
              </div>
              <p className="mb-4 text-sm text-fei-text/60">Enable your microphone now to start the assessment.</p>
              {micPermission === 'granted' ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400">
                  ✓ Microphone ready
                </div>
              ) : micPermission === 'denied' ? (
                <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                  ⚠ Microphone access denied. Please allow microphone access in your browser settings and refresh the page.
                </div>
              ) : (
                <button
                  onClick={requestMic}
                  className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-5 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" />
                    <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" />
                    <path d="M12 17v3.5" />
                    <path d="M9 20.5h6" />
                  </svg>
                  Enable microphone
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setSection('intro')}
              className="rounded-full border border-fei-text/20 px-6 py-3 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (micPermission !== 'granted') return
                setSection('warm-up')
              }}
              disabled={micPermission !== 'granted'}
              className="rounded-full bg-fei-yellow px-10 py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
            >
              {micPermission === 'granted' ? (
                <span className="inline-flex items-center justify-center gap-2">
                  Start assessment
                  <ChevronRightIcon />
                </span>
              ) : (
                'Enable microphone to start'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // WARM-UP
  if (section === 'warm-up') {
    const item = activeItems.warmup[warmupStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('warm-up', warmupStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Role Warm-Up" />
            <p className="mt-2 text-xs text-fei-text/40">These questions help personalize your pathway. There are no wrong answers here.</p>
          </div>

            <div className="mb-6 rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-5">
            <p className="mb-3 text-sm text-fei-text/60">{item.context}</p>
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (warmupStep < activeItems.warmup.length - 1) {
                setWarmupStep(warmupStep + 1)
              } else {
                setSection('reading')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? (
              'Select an option to continue'
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {warmupStep < activeItems.warmup.length - 1 ? 'Next' : 'Continue to Reading'}
                <ChevronRightIcon />
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // READING
  if (section === 'reading') {
    const item = activeItems.reading[readingStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('reading', readingStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Professional Reading" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Read carefully</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (readingStep < activeItems.reading.length - 1) {
                setReadingStep(readingStep + 1)
              } else {
                setSection('listening')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? (
              'Select an option to continue'
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {readingStep < activeItems.reading.length - 1 ? 'Next' : 'Continue to Listening'}
                <ChevronRightIcon />
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // LISTENING
  if (section === 'listening') {
    const item = activeItems.listening[listeningStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('listening', listeningStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Listening in Context" />
            <p className="mt-2 text-xs text-fei-text/40">Use headphones for best results.</p>
          </div>

          <div className="mb-6">
            <AudioPlayer script={item.script} itemId={item.id} />
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (listeningStep < activeItems.listening.length - 1) {
                setListeningStep(listeningStep + 1)
              } else {
                setSection('vocabulary')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? (
              'Select an option to continue'
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {listeningStep < activeItems.listening.length - 1 ? 'Next' : 'Continue to Vocabulary'}
                <ChevronRightIcon />
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // VOCABULARY
  if (section === 'vocabulary') {
    const item = activeItems.vocabulary[vocabStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('vocabulary', vocabStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Football Vocabulary" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <p className="text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (vocabStep < activeItems.vocabulary.length - 1) {
                setVocabStep(vocabStep + 1)
              } else {
                setSection('functional')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? (
              'Select an option to continue'
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {vocabStep < activeItems.vocabulary.length - 1 ? 'Next' : 'Continue to Functional Communication'}
                <ChevronRightIcon />
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // FUNCTIONAL COMMUNICATION
  if (section === 'functional') {
    const item = activeItems.functional[functionalStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('functional', functionalStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Functional Communication" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <p className="text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (functionalStep < activeItems.functional.length - 1) {
                setFunctionalStep(functionalStep + 1)
              } else {
                setSection('writing')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? (
              'Select an option to continue'
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {functionalStep < activeItems.functional.length - 1 ? 'Next' : 'Continue to Writing'}
                <ChevronRightIcon />
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // WRITING
  if (section === 'writing') {
    const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={16} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Written Production" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Situation</p>
            <p className="text-sm leading-relaxed text-fei-text/80">
{selectedRole === 'Head Coach'
                ? 'You are briefing the squad two hours before a match against a high-pressing opponent. Focus on what they will face, what your plan is, and what tone you want to set.'
                : selectedRole === 'Assistant Coach'
                  ? 'You are closing a training session after a pressing exercise. The players pressed well in the first repetitions, but in reps 5–8 they lost focus, spacing, and timing.'
                  : selectedRole === 'Academy Director'
                    ? 'You need to send a short message to academy coaches about this year’s development standards. Explain that the academy will assess readiness, not only physical dominance or short-term match performance. Mention that the U16 group is strong, but standards must remain consistent.'
                    : selectedRole === 'Head of Scouting'
                      ? 'You need to write a short Q4 recruitment memo for leadership. Include priority profiles, strategic logic, and the next decision step.'
                      : selectedRole === 'Scout'
                        ? 'You need to write a short scout report recommendation for a technically strong player with inconsistent form. Include profile fit, risk, and next step.'
                        : "After training today, you developed tightness in your left hamstring during the second half. It started when you made a sharp turning movement while sprinting. The sensation increased slightly during the cool-down. You want to report this to the physiotherapist before tomorrow's session."}
            </p>
          </div>

          <div className="mb-3">
            <p className="font-semibold text-fei-text">
              {selectedRole === 'Head Coach'
                ? 'Write the opening 3–5 sentences of your pre-match briefing.'
                : selectedRole === 'Assistant Coach'
                  ? 'Write 3–5 sentences to close the session. Include what went well, what needs to improve, and tomorrow’s focus.'
                  : selectedRole === 'Academy Director'
                    ? 'Write 3–5 sentences to academy coaches about development standards and player readiness.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Write 3–5 sentences for leadership with priority profiles, strategic logic, and next decision step.'
                      : selectedRole === 'Scout'
                        ? 'Write 3–5 sentences with player quality, profile fit, risk, and recommended next step.'
                        : 'Write a message to the physiotherapist reporting this discomfort.'}
            </p>
            <p className="mt-1 text-sm text-fei-text/50">Write 3–5 sentences in professional English.</p>
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="Hi, I wanted to report..."
            rows={6}
            className="mb-2 w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-5 py-4 text-sm text-fei-text placeholder-fei-text/20 focus:border-fei-yellow focus:outline-none resize-none"
          />
          <div className="mb-8 flex items-center justify-between text-xs text-fei-text/40">
            <span>{wordCount} words</span>
            <span>Target: 30–80 words</span>
          </div>

          <button
            onClick={() => setSection('speaking')}
            disabled={wordCount < 10}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            <span className="inline-flex items-center justify-center gap-2">
              Continue to Speaking
              <ChevronRightIcon />
            </span>
          </button>
        </div>
      </div>
    )
  }

  // SPEAKING
  if (section === 'speaking') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={17} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Speaking Production" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Situation</p>
            <p className="text-sm leading-relaxed text-fei-text/80">
{selectedRole === 'Head Coach'
                ? 'You have just substituted a senior player after 25 minutes in a 1–0 loss. The player expected to play 90 minutes. The crowd is loud and other players are watching.'
                : selectedRole === 'Assistant Coach'
                  ? 'Two players are not pressing together during a training exercise. One player jumps early, the other waits, and the opponent plays through the gap.'
                  : selectedRole === 'Academy Director'
                    ? 'The Sporting Director wants to fast-track a U18 striker into the first team. You believe the player is not ready yet and that a second-team loan is the better pathway.'
                    : selectedRole === 'Head of Scouting'
                      ? 'The board prefers big-name signings, but your recruitment model prioritizes system fit, early identification, and sustainable value.'
                      : selectedRole === 'Scout'
                        ? 'You need to defend a recommendation to the Director of Recruitment. The player is technical, affordable now, and likely to become more expensive, but there are consistency concerns.'
                        : 'You have just received feedback from the head coach about your last match. The coach said you were too slow in transition and needed to be more aggressive in pressing. You disagree slightly because the transition was fast and you were managing some discomfort.'}
            </p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-text">
              {selectedRole === 'Head Coach'
                ? 'Explain the substitution decision while protecting the relationship and your authority.'
                : selectedRole === 'Assistant Coach'
                  ? 'Correct both players clearly and professionally before restarting the drill.'
                  : selectedRole === 'Academy Director'
                    ? 'Explain your position clearly and professionally, balancing first-team need with player development.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Defend your recruitment strategy clearly and professionally to the board.'
                      : selectedRole === 'Scout'
                        ? 'Defend your recommendation clearly, including tactical fit, value, timing, and risk.'
                        : 'Explain how you would respond to the coach professionally.'}
            </p>
            <p className="mt-1 text-sm text-fei-text/50">Recommended time: 45–60 seconds. Recording stops automatically at 75 seconds.</p>
          </div>

          {isRecording && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Recording...</span>
                <span className="ml-auto text-sm font-bold text-red-400">{recordingTime}s</span>
              </div>
              <div className="h-2 w-full rounded-full bg-fei-text/10">
                <div
                  className="h-2 rounded-full bg-red-500 transition-all"
                  style={{ width: `${(recordingTime / 75) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-fei-text/40">
                {recordingTime < 45 ? 'Recommended minimum: 45 seconds. You can stop anytime.' : recordingTime < 60 ? 'Good length — you can continue' : 'Consider wrapping up.'}
              </p>
            </div>
          )}

          {recordingDone && (
            <div
              className={`mb-6 rounded-2xl border p-5 text-center ${
                recordingTime < 45
                  ? 'border-fei-yellow/25 bg-fei-yellow/[0.06]'
                  : 'border-green-500/20 bg-green-500/5'
              }`}
            >
              <p className={`text-sm font-semibold ${recordingTime < 45 ? 'text-fei-yellow' : 'text-green-400'}`}>
                {recordingTime < 45 ? `Recording saved (${recordingTime}s)` : `✓ Recording saved (${recordingTime}s)`}
              </p>
              <p className="mt-1 text-xs leading-5 text-fei-text/45">
                {recordingTime < 45
                  ? 'Your response is shorter than recommended. For a stronger AI Insight, try to speak for 45–60 seconds.'
                  : 'Your speaking sample has been captured.'}
              </p>
            </div>
          )}

          <div className="mb-4">
            {!isRecording && !recordingDone && (
              <button
                onClick={startRecording}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-3.5 font-bold text-white transition hover:bg-red-500/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" />
                  <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" />
                  <path d="M12 17v3.5" />
                  <path d="M9 20.5h6" />
                </svg>
                Start recording
              </button>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 py-3.5 font-bold text-red-400 transition hover:bg-red-500/10"
              >
                <span className="h-3 w-3 rounded-[3px] bg-current" />
                Stop recording
              </button>
            )}
          </div>

          {recordingDone && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRecordingDone(false)
                  setRecordingTime(0)
                  setIsRecording(false)
                }}
                className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-fei-text/20 px-5 py-2.5 text-sm font-medium text-fei-text/65 transition hover:border-fei-sky/35 hover:text-fei-sky"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M20 11a8 8 0 1 0-2.35 5.65" />
                  <path d="M20 4v7h-7" />
                </svg>
                Record again
              </button>
              <button
                onClick={() => finishAssessment(Math.min(4, Math.max(1, Math.round(recordingTime / 18))))}
                className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                {saving ? (
                  'Saving results...'
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Submit assessment
                    <ChevronRightIcon />
                  </span>
                )}
              </button>
            </div>
          )}

          {!isRecording && !recordingDone && (
            <button
              onClick={() => finishAssessment(1)}
              className="mt-4 w-full text-center text-xs text-fei-text/30 hover:text-fei-text/50 transition"
            >
              Skip speaking and submit
            </button>
          )}
        </div>
      </div>
    )
  }

  // RESULT
  if (section === 'result' && result) {
    const levelLabels: Record<string, string> = {
      A2: 'Foundation',
      B1: 'Intermediate',
      B2: 'Professional',
      C1: 'Advanced Professional',
    }

    const levelColors: Record<string, string> = {
      A2: 'text-fei-sky',
      B1: 'text-fei-sky',
      B2: 'text-fei-yellow',
      C1: 'text-fei-yellow',
    }

    const pathwayDescriptions: Record<string, string> = {
      A2: 'You understand basic football communication and can follow direct instructions in training and matchday contexts. Your pathway will build the confidence and vocabulary you need to communicate more clearly with coaches, medical staff, and teammates in everyday professional situations.',
      B1: 'You can manage many common football communication situations and respond professionally in routine interactions. Your pathway will help you communicate with more structure, confidence, and precision when situations become more complex.',
      B2: 'You communicate with clarity across most professional football situations and can handle feedback, tactical information, and role-related conversations with growing confidence. Your pathway will help you strengthen strategic control in pressure moments.',
      C1: 'You demonstrate advanced professional communication with strong awareness, precision, and maturity. Your pathway will help you refine leadership communication, negotiation, public presence, and high-pressure decision-making.',
    }

    const aiInsights: Record<string, string> = {
      A2: 'Your result shows a developing foundation in professional football English. You can handle some direct communication in familiar situations, but you need more consistency when instructions become faster, more tactical, or more pressure-based. Your next step is to strengthen real-time understanding, clarification skills, and clearer communication with coaches, teammates, and medical staff. FEI recommends starting with practical role-specific training so you can improve in the situations that affect your daily performance most.',
      B1: 'Your result shows that you can manage common football communication, especially when the context is familiar and the message is direct. Your next step is to communicate with more structure and precision when conversations become more detailed, tactical, or pressure-based. FEI recommends focused role-specific training to help you respond more confidently in professional situations.',
      B2: 'Your result shows strong professional communication potential across football-specific situations. You can understand and respond to many complex messages, but your next step is to improve strategic control in feedback, role conversations, and high-pressure communication. FEI recommends advanced role-specific training to help you communicate with more authority and precision.',
      C1: 'Your result shows advanced professional communication ability with strong awareness, precision, and maturity. Your next step is refinement: leadership communication, negotiation, public presence, and high-pressure decision-making. FEI recommends advanced training designed to sharpen your communication at the highest professional level.',
    }

    const pathwayFocus: Record<string, string[]> = {
      A2: [
        'Understanding tactical instructions',
        'Asking for clarification',
        'Reporting physical status',
        'Responding to basic feedback',
      ],
      B1: [
        'Tactical clarification',
        'Feedback response',
        'Medical communication',
        'Speaking with confidence under pressure',
      ],
      B2: [
        'Complex feedback conversations',
        'Playing-time and role discussions',
        'Public communication',
        'Leadership communication under pressure',
      ],
      C1: [
        'Advanced leadership communication',
        'Strategic negotiation',
        'Crisis and media communication',
        'Personal brand and reputation management',
      ],
    }

    const rolePathwayDescriptions: Record<string, string> =
      selectedRole === 'Head Coach'
        ? {
            A2: 'You can deliver clear tactical instructions in familiar situations. Your pathway will build your ability to manage feedback, staff alignment, and matchday communication with more authority.',
            B1: 'You communicate effectively with players and staff on routine matters. Your pathway will help you lead more complex team situations, match briefings, and feedback conversations with greater clarity.',
            B2: 'You lead teams with professional clarity and control. Your pathway will refine your crisis management, executive communication, and ability to influence staff and squad behavior under pressure.',
            C1: 'You command multi-audience communication strategically. Your pathway will deepen your ability to align football operations, lead through complexity, and represent the club with authority.',
          }
        : selectedRole === 'Assistant Coach'
          ? {
              A2: 'You can understand and deliver simple training instructions in familiar contexts. Your pathway will build confidence in tactical clarification, correction, and player support during training.',
              B1: 'You manage common assistant-coach communication tasks and can support players in routine training situations. Your pathway will strengthen precision, tactical explanation, and correction under pressure.',
              B2: 'You communicate with professional clarity across tactical and training contexts. Your pathway will refine how you translate coaching ideas, manage player confusion, and support staff alignment.',
              C1: 'You communicate with strategic precision and strong staff awareness. Your pathway will deepen your ability to translate tactical intent, correct behavior under pressure, and protect alignment across the coaching team.',
            }
          : selectedRole === 'Academy Director'
            ? {
                A2: 'You can understand basic academy communication and identify clear development information. Your pathway will help you communicate standards, expectations, and player pathway decisions with more confidence.',
                B1: 'You manage many routine academy communication situations and can explain common development needs. Your pathway will help you add structure, precision, and authority when speaking with staff, families, and leadership.',
                B2: 'You communicate academy standards with professional clarity across several stakeholder situations. Your pathway will help you strengthen difficult conversations, strategic reporting, and alignment with the first team.',
                C1: 'You demonstrate advanced academy leadership communication with strategic awareness and institutional maturity. Your pathway will refine board-level influence, stakeholder alignment, and high-pressure pathway decisions.',
              }
            : selectedRole === 'Head of Scouting'
              ? {
                  A2: 'You understand basic recruitment information and simple priorities. Your pathway will build profile language, scouting communication, and clearer recruitment criteria.',
                  B1: 'You manage common recruitment communication. Your pathway will strengthen precision, alignment, and recommendation structure across scouts and decision-makers.',
                  B2: 'You communicate recruitment priorities clearly. Your pathway will develop market reasoning, profile-fit communication, and executive recommendations.',
                  C1: 'You demonstrate strategic recruitment leadership. Your pathway will refine board-level influence, high-stakes alignment, and long-term recruitment value communication.',
                }
              : selectedRole === 'Scout'
                ? {
                    A2: 'You can understand basic scouting information and identify simple player strengths. Your pathway will build confidence in writing clearer observations and recommendations.',
                    B1: 'You can manage common scouting communication and explain routine player observations. Your pathway will strengthen evidence, comparison, and recommendation language.',
                    B2: 'You communicate player evaluations with professional clarity. Your pathway will develop strategic recruitment communication, risk framing, and executive recommendations.',
                    C1: 'You demonstrate strategic recruitment communication. Your pathway will refine board-level influence, market reasoning, and high-stakes recommendation defense.',
                  }
                : pathwayDescriptions

    const roleAiInsights: Record<string, string> =
      selectedRole === 'Head Coach'
        ? {
            A2: 'Your result shows a developing foundation in first-team coaching communication. You can communicate direct tactical ideas in familiar situations, but your next step is to build more structure when managing feedback, staff alignment, and matchday pressure. FEI recommends starting with clear tactical language and practical briefing work so your communication becomes more consistent with players and staff.',
            B1: 'Your result shows that you can manage routine coaching communication with players and staff. Your next step is to lead more complex situations with stronger structure, especially tactical adjustments, individual feedback, match briefings, and media responses. FEI recommends focused role-specific training to help you communicate decisions with clarity and authority.',
            B2: 'Your result shows strong professional coaching communication across tactical, staff, and pressure-based situations. Your next step is to refine crisis management, executive communication, and leadership under pressure. FEI recommends advanced role-specific training to help you influence players, staff, and decision-makers with greater strategic control.',
            C1: 'Your result shows advanced strategic communication for a first-team head coach. You can manage complex football messages across players, staff, media, and executives. Your next step is refinement: institutional alignment, high-pressure leadership, executive influence, and elite communication control.',
          }
        : selectedRole === 'Assistant Coach'
          ? {
              A2: 'Your result shows a developing foundation in assistant-coach communication. You can handle simple training instructions in familiar contexts, but your next step is to build more confidence in tactical clarification, player correction, and support during live training situations.',
              B1: 'Your result shows that you can manage common assistant-coach communication tasks and support players in routine training situations. Your next step is to communicate with more precision when explaining tactical details, correcting technique, and responding under pressure.',
              B2: 'Your result shows strong professional communication across tactical and training contexts. You can explain, correct, and support players with clarity. Your next step is to refine how you translate coaching ideas, manage player confusion, and maintain staff alignment under pressure.',
              C1: 'Your result shows strategic precision and strong staff awareness. You can translate tactical intent, correct behavior under pressure, and protect alignment across the coaching team. Your next step is advanced communication control in high-speed training and matchday support contexts.',
            }
          : selectedRole === 'Academy Director'
            ? {
                A2: 'Your result shows a developing foundation in academy leadership communication. You can understand basic development information and clear pathway updates, but your next step is to communicate standards, expectations, and player progression decisions with more confidence.',
                B1: 'Your result shows that you can manage many routine academy communication situations. Your next step is to add more structure, precision, and authority when explaining development needs to coaches, families, and leadership.',
                B2: 'Your result shows strong professional communication across academy standards, pathway decisions, and stakeholder situations. Your next step is to strengthen difficult conversations, strategic reporting, and alignment with the first team.',
                C1: 'Your result shows advanced academy leadership communication with strategic awareness and institutional maturity. Your next step is refinement: board-level influence, stakeholder alignment, high-pressure pathway decisions, and long-term development philosophy.',
              }
            : selectedRole === 'Head of Scouting'
              ? {
                  A2: 'Your result shows that you can understand direct recruitment information and simple priorities. Your next step is to build stronger profile language, clearer scouting criteria, and more confident communication with scouts and recruitment staff.',
                  B1: 'Your result shows that you can manage common recruitment communication. Your next step is to improve specificity, alignment, and recommendation structure so scouting reports connect more clearly to recruitment priorities and role profiles.',
                  B2: 'Your result shows strong professional recruitment communication. You can communicate priorities, profile fit, and market reality with clarity. Your next step is to develop sharper market reasoning and executive recommendation language under pressure.',
                  C1: 'Your result shows strategic recruitment leadership. You can frame fit, value, risk, and long-term squad sustainability for senior decision-makers. Your next step is refinement: board-level influence, high-stakes alignment, and institutional recruitment strategy.',
                }
              : selectedRole === 'Scout'
                ? {
                    A2: 'Your result shows that you can understand basic scouting information and identify simple player strengths. Your next step is to build clearer observation language, stronger report structure, and more confident recommendation writing.',
                    B1: 'Your result shows that you can manage common scouting communication and explain routine player observations. Your next step is to strengthen evidence, comparison language, and clearer recommendation structure.',
                    B2: 'Your result shows strong professional scouting communication. You can evaluate players with clarity and connect profile fit, risk, and recruitment timing. Your next step is to develop strategic recommendation defense and executive-ready language.',
                    C1: 'Your result shows advanced strategic scouting communication. You can frame opportunity, risk, value, and recommendation logic with confidence. Your next step is refinement: board-level influence, market reasoning, and high-stakes recommendation defense.',
                  }
                : aiInsights

    const rolePathwayFocus: Record<string, string[]> =
      selectedRole === 'Head Coach'
        ? {
            A2: [
              'Clear tactical language',
              'Basic briefing structure',
              'Simple staff communication',
              'Player feedback foundations',
            ],
            B1: [
              'Tactical adjustment',
              'Individual feedback',
              'Match briefings',
              'Media response under pressure',
            ],
            B2: [
              'Crisis communication',
              'Executive negotiation',
              'Leadership under pressure',
              'Advanced staff alignment',
            ],
            C1: [
              'Strategic influence',
              'High-pressure leadership',
              'Institutional alignment',
              'Elite communication control',
            ],
          }
        : selectedRole === 'Assistant Coach'
          ? {
              A2: [
                'Simple training instructions',
                'Basic tactical clarification',
                'Player support language',
                'Training vocabulary foundations',
              ],
              B1: [
                'Exercise explanation',
                'Pressing trigger correction',
                'Technique feedback',
                'Communication under repetition',
              ],
              B2: [
                'Tactical correction under fatigue',
                'Player confusion support',
                'Staff alignment',
                'Training motivation',
              ],
              C1: [
                'Head coach message translation',
                'Strategic tactical clarification',
                'Collective correction under pressure',
                'Advanced coaching-team alignment',
              ],
            }
          : selectedRole === 'Academy Director'
            ? {
                A2: [
                  'Basic academy updates',
                  'Development standards',
                  'Player pathway vocabulary',
                  'Clear staff communication',
                ],
                B1: [
                  'Talent pathway communication',
                  'Parent expectation management',
                  'Academy standards',
                  'Staff leadership basics',
                ],
                B2: [
                  'Organisational alignment',
                  'Fast-track pressure',
                  'Strategic academy reporting',
                  'First-team pathway decisions',
                ],
                C1: [
                  'Academy philosophy communication',
                  'Board-level influence',
                  'Stakeholder alignment',
                  'High-pressure pathway decisions',
                ],
              }
            : selectedRole === 'Head of Scouting'
              ? {
                  A2: [
                    'Recruitment profile language',
                    'Basic scouting communication',
                    'Simple priority updates',
                    'Recruitment criteria foundations',
                  ],
                  B1: [
                    'Scout report specificity',
                    'Profile-fit communication',
                    'Recommendation structure',
                    'Recruitment team alignment',
                  ],
                  B2: [
                    'Market intelligence',
                    'Strategic priority protection',
                    'Budget and value framing',
                    'Executive recommendation clarity',
                  ],
                  C1: [
                    'Board-level influence',
                    'High-stakes recruitment alignment',
                    'Sustainable squad value',
                    'Strategic risk and value framing',
                  ],
                }
              : selectedRole === 'Scout'
                ? {
                    A2: [
                      'Basic player observation',
                      'Scouting vocabulary',
                      'Simple strengths and weaknesses',
                      'Clear report foundations',
                    ],
                    B1: [
                      'Evidence-based reports',
                      'Player monitoring logic',
                      'Recommendation language',
                      'Recruitment communication basics',
                    ],
                    B2: [
                      'Profile fit and comparison',
                      'Risk and value framing',
                      'Market timing',
                      'Recommendation defense',
                    ],
                    C1: [
                      'Strategic recruitment communication',
                      'High-stakes recommendation defense',
                      'Market reasoning',
                      'Executive-ready scouting reports',
                    ],
                  }
                : pathwayFocus

    const focusItems = rolePathwayFocus[result.level] || rolePathwayFocus.A2
    const pathwayDescription = rolePathwayDescriptions[result.level] || rolePathwayDescriptions.A2
    const aiInsight = roleAiInsights[result.level] || roleAiInsights.A2
    const pathwayLabel = levelLabels[result.level] || 'Foundation'
    const pathwayColor = levelColors[result.level] || 'text-fei-sky'
    const overallEvidence = Math.round((result.score / result.maxScore) * 100)

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-block rounded-full bg-fei-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
              Assessment Complete
            </div>
            <h1 className="mt-4 text-4xl font-black text-fei-text">Your FEI Profile</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-fei-text/50">
              This short profile gives you your recommended starting pathway. Your full diagnostic report and personalized training plan are unlocked inside your FEI pathway.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-fei-yellow/20 bg-fei-yellow/[0.05] p-8 text-center lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-text/50">
                Recommended Pathway
              </p>
              <p className={`mt-5 text-8xl font-black ${pathwayColor}`}>
                {result.level}
              </p>
              <p className="mt-2 text-2xl font-bold text-fei-text">
                {pathwayLabel}
              </p>

              <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-fei-sky/20 bg-fei-bg/35 p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                  {selectedRole}
                </p>
                <p className="mt-2 text-lg font-bold text-fei-text">
                  {result.level} — {pathwayLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-fei-text/70">
                  {pathwayDescription}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
                Diagnostic Evidence
              </p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/35 p-5 text-center">
                  <p className="text-4xl font-black text-fei-yellow">{result.score} / {result.maxScore}</p>
                  <p className="mt-2 text-xs text-fei-text/45">Diagnostic score</p>
                </div>

                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/35 p-5 text-center">
                  <p className="text-4xl font-black text-fei-yellow">{overallEvidence}%</p>
                  <p className="mt-2 text-xs text-fei-text/45">Diagnostic evidence</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-fei-text/55">
                Your score helps FEI identify the most useful starting pathway for your football communication profile. It is not a pass/fail result.
              </p>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                AI Insight
              </p>
              <p className="max-w-5xl text-sm leading-relaxed text-fei-text/80">
                {aiInsight}
              </p>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
                Why this pathway?
              </p>
              <p className="text-sm leading-relaxed text-fei-text/70">
                Your diagnostic evidence shows that <span className="font-semibold text-fei-text">{result.level}</span> is the best starting point for your football communication profile. This is not a pass/fail result; it helps FEI recommend the pathway where targeted training can create the fastest and most relevant progress for your role.
              </p>
            </div>

            <div className="rounded-3xl border border-fei-sky/20 bg-fei-sky/[0.04] p-6 lg:col-span-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                Pathway Focus
              </p>
              <ul className="space-y-3 text-sm text-fei-text/70">
                {focusItems.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-fei-yellow" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-2xl border border-fei-yellow/20 bg-fei-yellow/[0.06] p-4">
                <p className="text-sm leading-6 text-fei-text/70">
                  Unlock your complete FEI report to see detailed strengths, development priorities, and your personalized training plan.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/learning')}
            className="mt-8 w-full rounded-full bg-fei-yellow py-4 text-base font-bold text-fei-bg transition hover:bg-fei-yellow/90"
          >
            <span className="inline-flex items-center justify-center gap-2">
              Start my FEI pathway
              <ChevronRightIcon />
            </span>
          </button>

          <p className="mt-4 text-center text-xs text-fei-text/30">
            Your short diagnostic profile has been saved. You can review your progress from your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading assessment...</p>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
