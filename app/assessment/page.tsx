'use client'

import Link from 'next/link'
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
      context: 'The assistant coach sends this message before training:\n\n"Today we work in a mid-block. Stay close to the 6 and protect the inside channel. When the ball goes wide to their fullback, jump with the nearest winger. If the pass stays central, hold your position."',
      question: 'The opposition keeps the ball in the center. What should you do?',
      options: [
        'A. Move wide and press their fullback',
        'B. Hold your position and protect the inside',
        'C. Drop into the penalty area immediately',
        'D. Follow the nearest winger toward the touchline',
      ],
      correct: 'B',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Feedback with Reasoning',
      context: 'After training, the analyst sends this note:\n\n"Your positioning was good when we defended crosses. The problem came when the second ball dropped. You reacted a little late, so the opponent could restart the attack. The first step is to scan earlier after the duel."',
      question: 'Which change would best address the analyst\'s concern?',
      options: [
        'A. Anticipate the next phase immediately after the aerial duel',
        'B. Attack the first cross with greater physical force',
        'C. Stay closer to the goalkeeper before the cross arrives',
        'D. Move forward only after the team has recovered possession',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Physical Status and Availability',
      context: 'Your physiotherapist sends this message:\n\n"Your recovery markers are not alarming, but your hamstring load is higher than normal. I do not think you need to sit out, but we should avoid a full match if we want you ready midweek. Let\'s plan your minutes and monitor intensity."',
      question: 'Which statement best reflects the balance between availability and risk?',
      options: [
        'A. You can start, but the workload should be controlled to protect your midweek availability',
        'B. You should complete normal match minutes and reduce training after the weekend',
        'C. You should miss the weekend match because the hamstring markers confirm an injury',
        'D. You are available without restrictions because the recovery markers are not alarming',
      ],
      correct: 'A',
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
      label: 'Item 12 — In-Game Tactical Adjustment',
      context: 'During the match, the opposition winger is repeatedly receiving the ball behind your fullback. The fullback asks you what to change.',
      question: 'Which response communicates the clearest immediate adjustment?',
      options: [
        'A. "Stay closer to him because he is finding too much space behind you."',
        'B. "I’ll drop earlier and cover inside. You stay tighter when the pass goes wide."',
        'C. "We need to defend better on that side before they create another chance."',
        'D. "Ask the midfielder to move across so we have more protection there."',
      ],
      correct: 'B',
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



const fitnessCoachItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Communication Focus',
      context: 'You are completing the FEI diagnostic for the Fitness Coach — Strength & Conditioning role.',
      question: 'Which communication situation is most central to your role?',
      options: [
        'A. Designing opposition analysis reports for the coaching staff.',
        'B. Explaining contract priorities to the recruitment department.',
        'C. Managing public comments after a difficult result.',
        'D. Managing physical load and reducing injury risk.',
      ],
      correct: 'D',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'The diagnostic personalizes the pathway based on your main communication demand.',
      question: 'Which communication task matters most in your daily work?',
      options: [
        'A. Presenting tactical changes to the full squad.',
        'B. Communicating load data clearly to coaches.',
        'C. Writing formal transfer recommendations.',
        'D. Handling media questions about selection.',
      ],
      correct: 'B',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Training Load Summary',
      context: 'Daily report:\\n\\n"The team average was 8.2 km. Peak speed reached 32 kph. Two players exceeded their weekly high-speed threshold. Monitor both for soreness tomorrow."',
      question: 'What should the fitness staff do tomorrow?',
      options: [
        'A. Monitor the two players who exceeded their threshold.',
        'B. Reduce load for the whole squad immediately.',
        'C. Focus only on the player with the highest speed.',
        'D. Increase sprint volume because the team average is stable.',
      ],
      correct: 'A',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Fatigue Trend',
      context: 'Player update:\\n\\n"High-intensity load has been trending up this week. Player A’s fatigue markers are down 12%, and his wellness score is 6/10. Reduce his Friday volume and monitor readiness for the weekend."',
      question: 'What is the recommended action?',
      options: [
        'A. Remove Player A from the weekend squad immediately.',
        'B. Increase Friday volume to test his readiness.',
        'C. Reduce Friday volume and monitor weekend readiness.',
        'D. Ignore the fatigue trend because wellness is above 5/10.',
      ],
      correct: 'C',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Tactical Demand vs Medical Risk',
      context: 'Training plan note:\\n\\n"The head coach wants high-intensity work from Monday to Wednesday. Current accumulated load is already at 85% of the safe weekly threshold. Adding another full high-intensity day pushes several players above 110%. We need to protect tactical intensity while adjusting the structure."',
      question: 'What is the main communication challenge?',
      options: [
        'A. Convincing the coach to cancel all tactical training.',
        'B. Balancing tactical needs with physical risk management.',
        'C. Explaining that the weekly threshold is not relevant.',
        'D. Prioritizing volume because intensity has already been planned.',
      ],
      correct: 'B',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Recovery Protocol',
      script: 'Post-match recovery today is simple: walk first, stretch after that, then ice. Within 30 minutes, take carbohydrates and start hydration. Replace 1.5 liters for each kilo lost.',
      question: 'What is the speaker describing?',
      options: [
        'A. A sprint preparation routine before training.',
        'B. A nutrition plan for matchday breakfast.',
        'C. A strength session after the match.',
        'D. A post-match recovery sequence.',
      ],
      correct: 'D',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Return-to-Play Progression',
      script: 'The player has completed six weeks of rehab and reached 70% intensity. We should use a graduated return: 30 minutes in the friendly, assess response, then consider 60 minutes next match.',
      question: 'What is the return plan?',
      options: [
        'A. Full match immediately because rehab is complete.',
        'B. One more week of full rest before any football.',
        'C. Gradual minutes with assessment between steps.',
        'D. Training only until he reaches 100% intensity.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Seasonal Risk Communication',
      script: 'The player reports fatigue, wellness is low, and the match is important. The coach needs him, but medical risk is elevated. We should frame this calmly: it is not about one match, it is about protecting availability across the season.',
      question: 'What is the best summary of the message?',
      options: [
        'A. Use evidence calmly and frame the decision around seasonal availability.',
        'B. Prioritize the match because the coach needs the player.',
        'C. Hold the player out without explaining the evidence.',
        'D. Tell the player the risk is too high to train again this month.',
      ],
      correct: 'A',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Heart Rate Recovery',
      context: 'The fitness report states: “Heart rate recovery was slower than usual after the final running block.”',
      question: 'What does heart rate recovery refer to?',
      options: [
        'A. The highest heart rate reached during exercise.',
        'B. How quickly the heart rate returns toward normal after exercise.',
        'C. The total number of sprints completed in the session.',
        'D. The amount of water lost during high-intensity work.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Load Management',
      context: 'The coach asks why the staff is discussing load management before the next match.',
      question: 'What does load management mean?',
      options: [
        'A. Choosing which players start based only on tactical preference.',
        'B. Increasing training volume to improve match fitness quickly.',
        'C. Recording all gym exercises after each training session.',
        'D. Controlling physical demand to improve performance and reduce injury risk.',
      ],
      correct: 'D',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Acute to Chronic Ratio',
      context: 'The report mentions: “His acute to chronic ratio is rising after three intense sessions.”',
      question: 'What does this ratio compare?',
      options: [
        'A. Sprint speed with total passing accuracy.',
        'B. Current wellness score with sleep quality.',
        'C. Recent workload with the player’s average longer-term workload.',
        'D. Injury history with current match availability.',
      ],
      correct: 'C',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Explaining an Individual Plan',
      context: 'A player asks why his plan is lighter today. His weekly total is 18 km, with 4 km high-intensity work today, 5 km moderate work tomorrow and two lighter days before the match.',
      question: 'Which explanation is clearest?',
      options: [
        'A. You have 18 km this week. Today is high intensity, tomorrow is moderate, then two lighter days to recover before the match.',
        'B. Your plan is lighter because the match matters and we do not want unnecessary questions.',
        'C. You already worked enough this week, so we are lowering everything until matchday.',
        'D. The data is complicated, but the main idea is that you should trust the plan.',
      ],
      correct: 'A',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Player Resists Recovery',
      context: 'A player says he does not want a recovery day because he feels he must prove fitness before selection.',
      question: 'What is the best response?',
      options: [
        'A. If you want to prove fitness, we can increase today and see how you react.',
        'B. The data shows fatigue. One recovery day now protects you from losing more time later.',
        'C. Selection is not your decision, so the recovery plan should not be discussed.',
        'D. You probably feel fine, but the medical staff should decide without you.',
      ],
      correct: 'B',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Coach Pressure Before Match',
      context: 'The head coach wants to add another high-intensity block because the match is important. Current load is at 88% of the safe threshold; the extra block would push several players above 100%.',
      question: 'What should you say?',
      options: [
        'A. The match is important, so we should accept the risk for one week.',
        'B. The safest option is to remove intensity completely before the match.',
        'C. We can add volume if players feel mentally ready for the session.',
        'D. Keep intensity, but reduce volume so quality stays high without crossing the threshold.',
      ],
      correct: 'D',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Institutional Pressure',
      context: 'A senior executive says: “We need our best players available now. Can’t we push through and manage the consequences later?”',
      question: 'Which response is most strategic?',
      options: [
        'A. If the institution wants risk, we can document it and push the players.',
        'B. The safest answer is to stop high-intensity work until the schedule improves.',
        'C. Our role is to maximize availability intelligently, not trade short-term minutes for longer absences.',
        'D. The coach should decide because performance responsibility sits with the first team.',
      ],
      correct: 'C',
    },
  ],
}



const performanceAnalystItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Communication Focus',
      context: 'You are completing the FEI diagnostic for the Performance Analyst — First Team Analysis role.',
      question: 'Which communication situation is most central to your role?',
      options: [
        'A. Managing player recovery plans with the medical team.',
        'B. Communicating video and data evidence to coaches and staff.',
        'C. Negotiating player contracts with external agents.',
        'D. Running daily tactical drills with the first-team squad.',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'The diagnostic personalizes the pathway based on your main communication demand.',
      question: 'Which communication task matters most in your daily work?',
      options: [
        'A. Giving live touchline instructions during the match.',
        'B. Writing medical updates after training sessions.',
        'C. Presenting tactical patterns and analysis clearly.',
        'D. Handling player salary and contract discussions.',
      ],
      correct: 'C',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Transition Pattern',
      context: 'Analysis note:\\n\\n"The team pressed well for the first 20 minutes, but lost structure after that. In transition, the best moments came from quick counters after winning the ball."',
      question: 'Which attacking pattern was most useful?',
      options: [
        'A. Quick counters after winning possession.',
        'B. Long possession phases in the back line.',
        'C. Slow circulation to protect the result.',
        'D. Crossing early from both wide areas.',
      ],
      correct: 'A',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — High Line Weakness',
      context: 'Opponent report:\\n\\n"Team A defends with a high line. When pressed, they often play long. Their main weakness appears when the press is broken and there is space behind the back line."',
      question: 'What should your team look to exploit?',
      options: [
        'A. The space behind the defensive line.',
        'B. The goalkeeper’s short distribution errors.',
        'C. The opponent’s low-block defending.',
        'D. The fullbacks’ lack of attacking width.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Movement Intelligence',
      context: 'Player report:\\n\\n"The midfielder completed 78% of his passes and created six key passes. The numbers are useful, but the video shows something more important: 15 off-ball movements created space before the final pass. His value is not only in possession."',
      question: 'What is the analyst highlighting?',
      options: [
        'A. The player’s passing accuracy is too low for the role.',
        'B. The player’s value comes only from key passes.',
        'C. The player should be judged mainly by final assists.',
        'D. Off-ball movement adds value beyond basic data.',
      ],
      correct: 'D',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Scanning Before Receiving',
      script: 'The number 8 does not check his shoulder before receiving. The defender behind him is free. The simple solution is to scan before the ball arrives.',
      question: 'What is the main recommendation?',
      options: [
        'A. Receive deeper to avoid pressure.',
        'B. Scan before receiving the ball.',
        'C. Pass backward more often.',
        'D. Avoid receiving in midfield.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Zone-Based Pressing Response',
      script: 'They press as a unit in midfield when the pass goes sideways. If we play forward early, they drop instead of jumping. The response changes by zone: high attack, midfield press, compact defensive block.',
      question: 'What is the main idea?',
      options: [
        'A. The opponent presses the same way in every zone.',
        'B. The opponent only defends deep and never presses.',
        'C. The opponent responds differently depending on the zone.',
        'D. The opponent leaves midfield open after every forward pass.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Possession Loss Interpretation',
      script: 'The coach asks why we lost possession. The data says 68% of losses came from poor first touch under pressure, not risky passing. The problem is execution under pressure, not the intention to play forward.',
      question: 'What is the analyst’s interpretation?',
      options: [
        'A. The team should stop passing forward in build-up.',
        'B. The coach’s observation is wrong and should be ignored.',
        'C. The problem is mainly tactical risk-taking.',
        'D. The issue is technical execution under pressure.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Possession Accuracy',
      context: 'The report states: “Possession accuracy dropped to 74% in the second half.”',
      question: 'What does possession accuracy mean here?',
      options: [
        'A. How often the team created shots from possession.',
        'B. How long the team kept the ball in each phase.',
        'C. The percentage of passes completed successfully.',
        'D. The number of defensive actions after losing possession.',
      ],
      correct: 'C',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Progressive Pass',
      context: 'The analyst says: “The key action was the progressive pass into the final third.”',
      question: 'What is a progressive pass?',
      options: [
        'A. A safe pass that keeps possession in the same zone.',
        'B. A pass that moves the ball meaningfully toward goal.',
        'C. A pass made by the most advanced midfielder.',
        'D. A pass played immediately after winning a tackle.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Spatial Dominance',
      context: 'The report says: “We had spatial dominance in the left half-space, even before the chance was created.”',
      question: 'What does spatial dominance mean here?',
      options: [
        'A. Having more shots from one side of the pitch.',
        'B. Defending deeper to protect the central corridor.',
        'C. Maintaining possession for long periods without pressure.',
        'D. Controlling important pitch areas through positioning.',
      ],
      correct: 'D',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Presenting a Video Clip',
      context: 'You are showing a video clip to the coaching staff. The fullback receives wide, and your midfielder is too deep to press on time.',
      question: 'Which explanation is clearest?',
      options: [
        'A. Watch the fullback receive. Our midfielder is too deep, so the press arrives late.',
        'B. The clip shows the fullback receiving, but the main issue is general intensity.',
        'C. We should press this action, although the timing is not the key detail.',
        'D. The midfielder is involved, but the fullback’s touch matters more than our shape.',
      ],
      correct: 'A',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Data Contradicts Observation',
      context: 'A coach says, “We lost the ball because we were too risky.” Your data shows the main issue was poor first touch under pressure.',
      question: 'What is the best response?',
      options: [
        'A. The data proves the team was not risky, so the tactical concern is wrong.',
        'B. Risk may be part of it, but we should avoid correcting technique too early.',
        'C. Let me show the sequence: the losses come after poor first touch under pressure.',
        'D. We should remove forward passes until the players make fewer mistakes.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Coach Challenges Recommendation',
      context: 'You recommend testing a new build-up adjustment. The coach is skeptical and wants proof before using it in a match.',
      question: 'What is the best response?',
      options: [
        'A. The data is clear, so we should apply it immediately.',
        'B. If the coach is unsure, we should leave the idea for another cycle.',
        'C. The recommendation is valid, but implementation depends on player confidence.',
        'D. Let’s test it for ten minutes in training and review the evidence afterward.',
      ],
      correct: 'D',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Multiple Interpretations',
      context: 'The head coach, assistant coach and fitness coach interpret the same performance pattern differently. You need to frame your analysis without dismissing any stakeholder.',
      question: 'Which response is most strategic?',
      options: [
        'A. The data is objective, so the interpretation should be the same for everyone.',
        'B. The data shows what happened; the meaning depends on tactical and physical context.',
        'C. The coaches should agree first, then the analyst can prepare the report.',
        'D. The safest approach is to present only numbers and avoid interpretation.',
      ],
      correct: 'B',
    },
  ],
}



const nutritionistItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Role Focus',
      context: 'You are working as a performance nutritionist with a first-team squad.',
      question: 'Which situation best represents your core role?',
      options: [
        'A. Preparing medical treatment notes for injured players.',
        'B. Educating players on fueling, hydration and recovery.',
        'C. Designing tactical plans for matchday execution.',
        'D. Negotiating food supplier contracts for the club.',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Daily Communication Priority',
      context: 'Your work requires both nutrition knowledge and player behavior change.',
      question: 'Which communication task is most important for your daily impact?',
      options: [
        'A. Writing general meal plans without follow-up.',
        'B. Explaining nutrition only during team meetings.',
        'C. Reporting kitchen stock issues to operations staff.',
        'D. Personalizing plans and helping players follow them.',
      ],
      correct: 'D',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Post-Training Recovery Timing',
      context: 'A player receives this schedule:\\n\\n"Breakfast: carbohydrates and protein. 9:30am pre-training snack: banana and almonds. Post-training: recovery meal within 30 minutes."',
      question: 'What should the player do after training?',
      options: [
        'A. Eat almonds only before the recovery meal.',
        'B. Wait until dinner to replace the meal properly.',
        'C. Eat the recovery meal within 30 minutes.',
        'D. Skip the snack if breakfast had protein.',
      ],
      correct: 'C',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Match-Day Hydration Protocol',
      context: 'The protocol says:\\n\\n"The day before the match, target 3–4L hydration. On match day: 500ml with breakfast, 300ml two hours before kick-off, small sips during warm-up, and 1.5L for every kilogram lost after the match."',
      question: 'What is the post-match hydration recommendation?',
      options: [
        'A. Drink 1.5L for each kilogram of body weight lost.',
        'B. Drink 500ml after breakfast and wait until recovery meal.',
        'C. Drink 300ml two hours before the next session.',
        'D. Drink small sips only if thirst remains high.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Sleep, Digestion and Recovery',
      context: 'A player reports poor sleep and digestive discomfort after evening training. Dinner is usually at 7:00pm and is high in fat. Hydration is low. The recommendation is to move dinner earlier, reduce fat, improve carbohydrate timing and increase fluids gradually.',
      question: 'What is the main meaning of this recommendation?',
      options: [
        'A. The player should reduce carbohydrates because they disturb sleep.',
        'B. The issue is mostly psychological and not linked to food timing.',
        'C. Meal timing and composition may be affecting sleep and recovery.',
        'D. A heavy dinner is useful if training finishes late in the day.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Fueling Before and After Training',
      script: 'Carbohydrates two to three hours before training help provide energy. After training, carbohydrates plus protein within 30 minutes help recovery.',
      question: 'What is the main difference between the two recommendations?',
      options: [
        'A. Before training is mainly for hydration; after training is for sleep.',
        'B. Before training supports energy; after training supports recovery.',
        'C. Before training needs protein only; after training needs carbohydrates only.',
        'D. Before training should be avoided if recovery is already strong.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Second-Half Energy Problem',
      script: 'The player’s energy drops in the second half. His breakfast is five hours before kick-off, and his pre-match snack is too light. Add a carbohydrate snack one hour before the match to improve available energy.',
      question: 'What is the likely nutrition issue?',
      options: [
        'A. The player is taking too much fluid before the match.',
        'B. The carbohydrate timing before the match is insufficient.',
        'C. The recovery meal after the match is too early.',
        'D. The player needs less breakfast and more fasting time.',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Nutrition During Ramadan',
      script: 'The player is fasting during the day. We need to respect that. The pre-dawn meal should include slow-release carbohydrates and protein. After sunset, we prioritize hydration and recovery. The plan must be flexible, respectful and performance-focused.',
      question: 'What is the nutritionist’s best approach?',
      options: [
        'A. Keep the normal matchday plan because performance routines should not change.',
        'B. Ask the player to avoid training until the fasting period ends.',
        'C. Focus only on hydration and leave food choices to the player.',
        'D. Adapt the protocol respectfully around fasting and recovery windows.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Glycogen',
      context: 'The nutritionist says: “We need to restore glycogen after the match.”',
      question: 'What does glycogen refer to in this context?',
      options: [
        'A. Stored energy in the muscles used during exercise.',
        'B. A vitamin that controls hydration during training.',
        'C. A digestive enzyme used after heavy meals.',
        'D. A recovery drink taken only after injuries.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Nutrient Timing',
      context: 'The plan says: “Nutrient timing is important on double-session days.”',
      question: 'What does nutrient timing mean?',
      options: [
        'A. Eating only when the player feels hungry.',
        'B. Choosing foods based only on total calories.',
        'C. Planning when nutrients are consumed around training.',
        'D. Avoiding all snacks between team meals.',
      ],
      correct: 'C',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Micronutrient Density',
      context: 'The report says: “The player’s meals are high in calories but low in micronutrient density.”',
      question: 'What does micronutrient density mean?',
      options: [
        'A. The amount of protein included in every meal.',
        'B. The speed at which carbohydrates are digested.',
        'C. The percentage of calories from fat sources.',
        'D. The vitamins and minerals provided relative to calories.',
      ],
      correct: 'D',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Explaining a Basic Nutrition Plan',
      context: 'A player asks why breakfast and the post-training meal are both important.',
      question: 'Which response is clearest?',
      options: [
        'A. Breakfast is useful, but the post-training meal matters only after matches.',
        'B. Breakfast fuels the session. The post-training meal helps recovery and prepares the next session.',
        'C. Both meals are important because players should eat whenever food is available.',
        'D. The plan is standard for everyone, so following it is the main objective.',
      ],
      correct: 'B',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Adherence and Behavior Change',
      context: 'A player struggles to follow the full plan. He often skips the post-training meal and says the plan feels too much.',
      question: 'What is the best response?',
      options: [
        'A. If the plan feels difficult, we can remove most structure for now.',
        'B. You need to follow the complete plan before we can measure progress.',
        'C. Start with one change: the post-training meal. Once that is automatic, we add the next step.',
        'D. Skipping meals shows low discipline, so we need stricter monitoring immediately.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Dietary Restriction Support',
      context: 'A vegetarian player worries that he cannot meet protein targets during a heavy training week.',
      question: 'Which response is most professional?',
      options: [
        'A. We can meet your protein needs with planned options such as tofu, legumes, dairy or fortified alternatives.',
        'B. Vegetarian diets are difficult during heavy weeks, so targets should be lower.',
        'C. Protein timing is less important if carbohydrate intake is already high.',
        'D. You should use supplements instead of adjusting meals this week.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Complex Multi-Stakeholder Solution',
      context: 'A player has digestive sensitivity before training. The coach wants him to eat a heavier pre-training meal because the session will be intense. The player is worried about discomfort.',
      question: 'What is the strongest professional response?',
      options: [
        'A. The coach’s request should guide the plan because the session is demanding.',
        'B. The player should avoid pre-training food to prevent discomfort.',
        'C. Use the normal pre-training meal and review symptoms afterward.',
        'D. Use easily digestible carbohydrates before training and keep the heavier meal for recovery.',
      ],
      correct: 'D',
    },
  ],
}



const physiotherapistItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Communication Focus',
      context: 'You are completing the FEI diagnostic for the Physiotherapist — Medical & Rehabilitation role.',
      question: 'Which communication situation is most central to your role?',
      options: [
        'A. Designing tactical opposition reports for the coaching staff.',
        'B. Negotiating player contracts with recruitment leadership.',
        'C. Assessing injuries and guiding return-to-play decisions.',
        'D. Preparing public comments after difficult match results.',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'The diagnostic personalizes the pathway based on your main communication demand.',
      question: 'Which communication task matters most in your daily work?',
      options: [
        'A. Explaining transfer value to the sporting director.',
        'B. Communicating injury status clearly to players and staff.',
        'C. Delivering tactical instructions during the match.',
        'D. Creating public media responses for the club.',
      ],
      correct: 'B',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Initial Injury Note',
      context: 'Medical note:\\n\\n"Ankle pain started Friday. Swelling is present and movement is limited. Possible mild sprain. Rest for 48 hours and reassess on Monday."',
      question: 'What is the recommended next step?',
      options: [
        'A. Begin full training because the injury is mild.',
        'B. Complete imaging immediately before any rest period.',
        'C. Return to running if swelling improves by Saturday.',
        'D. Rest for 48 hours and reassess on Monday.',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Rehabilitation Timeline',
      context: 'Rehab update:\\n\\n"Grade 1 hamstring strain confirmed. Week 1 is rest and protection. Weeks 2–4 are gradual strength and running work. Weeks 5–6 are sport-specific return. Expected timeline: 5–6 weeks."',
      question: 'What is the expected recovery timeline?',
      options: [
        'A. Five to six weeks, with gradual progression.',
        'B. One week, if pain decreases quickly.',
        'C. Two to four weeks, ending after running work.',
        'D. Six weeks of complete rest before sport-specific work.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Complex Pain Presentation',
      context: 'Case note:\\n\\n"The player reports knee pain. Imaging does not explain the full complaint, and pain behavior is inconsistent. The medical team should continue physiotherapy while also involving sports psychology to address fear, confidence and pain response."',
      question: 'What is the main recommendation?',
      options: [
        'A. Stop physiotherapy until imaging gives a clearer answer.',
        'B. Treat the complaint as psychological and reduce medical work.',
        'C. Use a multidisciplinary plan that includes physiotherapy and psychology.',
        'D. Clear the player because imaging does not show a major injury.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Pain Location and Type',
      script: 'Where is the pain? Lower back. When did it start? Two days ago. What were you doing? Turning in midfield. Is it sharp or dull? Sharp.',
      question: 'What symptom is being reported?',
      options: [
        'A. Dull knee pain after sprinting.',
        'B. Sharp lower back pain after turning.',
        'C. Sharp ankle pain after landing.',
        'D. General muscle soreness after training.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Post-Op Return Plan',
      script: 'The player is 16 weeks post-op. Strength is 92%, agility is 88%, and confidence is 7 out of 10. I recommend a graduated return: first a friendly, then 30 minutes in the next match if the response is good.',
      question: 'What return-to-play plan is suggested?',
      options: [
        'A. Full match immediately because strength is above 90%.',
        'B. Graduated return with a friendly first and limited minutes after.',
        'C. No football yet because agility is below strength level.',
        'D. Training only until confidence reaches 10 out of 10.',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Fear of Re-Injury',
      script: 'The player is 12 weeks post-injury and physically progressing well. The main concern now is fear of re-injury. We need confidence-building exposure and psychology support alongside the physical plan.',
      question: 'What is the key issue?',
      options: [
        'A. The injury has returned and the player must stop completely.',
        'B. The physical plan should replace psychology support.',
        'C. The player is ready because physical progress is good.',
        'D. Psychological confidence must be addressed with physical rehab.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Range of Motion',
      context: 'The report says: “Range of motion is still limited after the ankle sprain.”',
      question: 'What does range of motion mean?',
      options: [
        'A. The distance a player covers during running.',
        'B. The speed reached during a sprint.',
        'C. How much a joint can move.',
        'D. How long pain lasts after treatment.',
      ],
      correct: 'C',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Load Tolerance',
      context: 'The physiotherapist says: “We need to test his load tolerance before increasing training intensity.”',
      question: 'What does load tolerance mean?',
      options: [
        'A. How much physical demand the player can safely handle.',
        'B. How well the player understands tactical instructions.',
        'C. How much pain the player can ignore during the match.',
        'D. How quickly the player completes rehabilitation paperwork.',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Functional Capacity',
      context: 'Before return to play, the report says: “Functional capacity must match the demands of the position.”',
      question: 'What does functional capacity refer to?',
      options: [
        'A. General fitness level measured by total weekly distance.',
        'B. The player’s motivation to return to competition.',
        'C. Medical imaging results after the injury.',
        'D. Ability to perform sport-specific movements required for play.',
      ],
      correct: 'D',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Explaining a Grade 1 Strain',
      context: 'A player asks what a Grade 1 hamstring strain means and whether the muscle is torn.',
      question: 'Which explanation is clearest?',
      options: [
        'A. It is not serious, so you should be back as soon as you feel comfortable.',
        'B. It is a mild strain, not a full tear. We follow a 5–6 week protocol to return safely.',
        'C. It is a muscle problem, but the exact timeline depends only on pain tomorrow.',
        'D. It means your hamstring is damaged, so we avoid football for several months.',
      ],
      correct: 'B',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Player Wants Early Return',
      context: 'A player wants to return early because an important match is coming. He is improving, but testing shows he is not ready for full-speed work.',
      question: 'What is the best response?',
      options: [
        'A. If you accept the risk, we can try full training and see how it feels.',
        'B. The match is important, so we can shorten the plan if pain stays low.',
        'C. Returning early increases re-injury risk. We need you back strong, not just back quickly.',
        'D. You are not ready, and selection pressure should not affect the medical plan.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Coach Pressure on Availability',
      context: 'The head coach asks whether a player can be available this weekend. Strength is 85%, and the player has not completed a graduated return.',
      question: 'What should you say?',
      options: [
        'A. At 85% strength, availability is risky. A 95% target plus graduated minutes is safer.',
        'B. He can be available if we limit his tactical role and avoid defensive actions.',
        'C. The coach can decide because team need is part of the final decision.',
        'D. He should be held out until every test is perfect and risk is zero.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Complex Case Framing',
      context: 'A player has real pain after injury, but fear and previous trauma are also affecting movement confidence. Coaches are confused because imaging is improving.',
      question: 'Which framing is most professional?',
      options: [
        'A. The pain is probably psychological now, so we should reduce physical treatment.',
        'B. The scan is improving, so we should push him to trust the knee again.',
        'C. The case is unclear, so we should delay decisions until symptoms are simple.',
        'D. The pain is real and fear is part of the case. We treat both through rehab and psychology support.',
      ],
      correct: 'D',
    },
  ],
}



const sportsPsychologistItems = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Primary Communication Focus',
      context: 'You are completing the FEI diagnostic for Sports Psychologist — Mental Performance.',
      question: 'Which situation is most central to your role?',
      options: [
        'A. Preparing tactical reports for coaching staff.',
        'B. Managing physical load during training weeks.',
        'C. Building trust and supporting performance behavior.',
        'D. Writing recruitment recommendations for players.',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'Different sports psychology tasks require different language, tone and confidentiality awareness.',
      question: 'Which communication area usually demands the most care?',
      options: [
        'A. Managing confidence, pressure and resilience.',
        'B. Explaining transfer value to recruitment staff.',
        'C. Correcting technical errors during training.',
        'D. Planning recovery meals after matches.',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Confidence Check-In Note',
      context: 'Player check-in note:\\n\\n"Confidence is down after recent missed chances. Sleep has been poor. Mood is frustrated but the player remains engaged. Red flags: none. Schedule confidence conversation on Friday."',
      question: 'What is the best summary of the support level?',
      options: [
        'A. The player needs immediate removal from matchday duties.',
        'B. The player has no performance concern to discuss.',
        'C. The player needs medical imaging before psychology support.',
        'D. Concern is low, but confidence support is appropriate.',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Anxiety Before Matches',
      context: 'Case note:\\n\\n"Before matches, the player reports anxiety with tight chest and faster breathing. Performance drops when anxious. The pattern appears linked to perfectionism: the player believes mistakes are unacceptable. Plan: breathing routine and reframing mistakes as learning."',
      question: 'What is the main intervention focus?',
      options: [
        'A. Increase physical conditioning before matches.',
        'B. Use breathing routines and reframe perfectionism.',
        'C. Remove all pre-match expectations from the player.',
        'D. Focus only on technical finishing practice.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Grief, Isolation and Performance',
      context: 'Case note:\\n\\n"The player is grieving a personal loss, underperforming and becoming isolated. Medical screening is clear. The response appears consistent with grief and adjustment difficulty. Plan: coordinate football support with grief counseling and maintain long-term monitoring."',
      question: 'What is the key recommendation?',
      options: [
        'A. Treat the case as a short technical performance issue.',
        'B. Provide long-term psychological support with football integration.',
        'C. Keep the case only between the player and head coach.',
        'D. Return the player to full pressure as soon as possible.',
      ],
      correct: 'B',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Baseline Mental Check-In',
      script: 'How are you feeling mentally this week? Do you feel pressure before matches? How is your confidence? Are you sleeping well? Any concerns you want to discuss?',
      question: 'What is the purpose of this conversation?',
      options: [
        'A. To select the player for the next match.',
        'B. To challenge the player’s tactical decisions.',
        'C. To establish a simple mental-performance baseline.',
        'D. To explain a full clinical treatment plan.',
      ],
      correct: 'C',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Performance Setback Response',
      script: 'The player is disappointed after a poor match, but he is still engaged. He says he knows what he needs to work on. We should normalize disappointment and separate one performance from his value as a player.',
      question: 'What is the main message?',
      options: [
        'A. Separate the poor performance from the player’s self-worth.',
        'B. Tell the player the match result does not matter.',
        'C. Avoid discussing the poor performance this week.',
        'D. Focus only on tactical mistakes and ignore emotion.',
      ],
      correct: 'A',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Anxiety Before an Important Match',
      script: 'The player feels fear before the important match. The coach wants confidence, but eliminating anxiety completely is unrealistic. We should help him transform that energy into activation and focus.',
      question: 'What is the best interpretation?',
      options: [
        'A. The player should avoid the match because fear is present.',
        'B. The coach should stop discussing confidence this week.',
        'C. The goal is to remove all anxiety before kick-off.',
        'D. The goal is to channel anxiety into useful activation.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — Confidence',
      context: 'A coach says: “The player’s confidence has dropped after several missed chances.”',
      question: 'What does confidence mean here?',
      options: [
        'A. The player’s physical speed during games.',
        'B. Belief in the ability to perform well.',
        'C. The player’s tactical role in the team.',
        'D. The player’s match availability status.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Pressure Management',
      context: 'A player says: “I need help with pressure management before big matches.”',
      question: 'What does pressure management refer to?',
      options: [
        'A. Reducing training intensity before every match.',
        'B. Avoiding difficult matches until confidence returns.',
        'C. Using techniques to perform despite stress.',
        'D. Changing the tactical plan to reduce responsibility.',
      ],
      correct: 'C',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Resilience',
      context: 'The report says: “The player shows resilience after setbacks but still needs stronger recovery routines.”',
      question: 'What does resilience mean in this context?',
      options: [
        'A. Ignoring emotional reactions after mistakes.',
        'B. Staying physically available for every match.',
        'C. Avoiding pressure situations whenever possible.',
        'D. Recovering from setbacks and maintaining performance.',
      ],
      correct: 'D',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Overwhelmed Rookie',
      context: 'A young player says: “Everything at this level feels too fast. I’m not sure I belong here.”',
      question: 'What is the best response?',
      options: [
        'A. That reaction is normal at this level. Let’s practice one situation that feels difficult.',
        'B. You should not feel that way if you are ready for first-team football.',
        'C. The speed will improve only if you play more matches immediately.',
        'D. Try not to think about it and focus on training harder.',
      ],
      correct: 'A',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Confidence After an Error',
      context: 'A player lost confidence after a major mistake and says: “One error ruined everything.”',
      question: 'What is the best response?',
      options: [
        'A. You should forget the mistake and avoid thinking about it.',
        'B. The error was not important because everyone makes mistakes.',
        'C. One error gives information. We can learn from it without letting it define you.',
        'D. The coach will decide whether the error affects your selection.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Injury Psychology',
      context: 'A player in rehab says: “This is boring. I want to return faster. I’m tired of waiting.”',
      question: 'What is the best response?',
      options: [
        'A. If you feel ready, we can speed up the return timeline.',
        'B. Frustration is normal. The goal is patience now so you return stronger, not just earlier.',
        'C. Rehab is mostly physical, so motivation is not the main issue.',
        'D. You should avoid thinking about football until rehab ends.',
      ],
      correct: 'B',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Multi-Stakeholder Player Support',
      context: 'A player is struggling after injury, the coach wants technical clarity, the physio is managing rehab and the family is worried. Confidentiality must be protected.',
      question: 'What is the strongest professional framing?',
      options: [
        'A. The coach should receive all details so the football plan is clear.',
        'B. The family should lead the support because they know the player best.',
        'C. The physio should manage the case because injury is the main issue.',
        'D. Support must align medical, technical and personal needs while protecting confidentiality.',
      ],
      correct: 'D',
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
    <div className="mb-9">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-fei-bg/55">
          Item {current} of {total}
        </span>

        <span className="text-sm font-bold text-fei-bg">
          {Math.round((current / total) * 100)}%
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-fei-bg/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fei-yellow to-fei-sky transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function SectionBadge({ label }: { label: string }) {
  return (
    <div>
      <div className="h-1 w-20 rounded-full bg-fei-sky" />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-fei-bg/48">
        {label}
      </p>
    </div>
  )
}

function OptionButton({
  option,
  selected,
  onSelect,
  refined = false,
}: {
  option: string
  selected: boolean
  onSelect: () => void
  refined?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full items-center justify-between gap-5 border-b border-fei-bg/10 px-2 py-4 text-left transition last:border-b-0 sm:px-3 sm:py-5 ${
        selected
          ? 'bg-fei-sky/[0.09]'
          : 'hover:bg-white/80'
      }`}
    >
      <span
        className={`transition ${
          refined
            ? 'text-[15px] font-normal leading-6 tracking-[-0.008em] sm:text-[1rem]'
            : 'text-[15px] font-normal leading-7 sm:text-base'
        } ${
          selected
            ? 'text-fei-bg'
            : 'text-fei-bg/68 group-hover:text-fei-bg'
        }`}
      >
        {option}
      </span>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
          selected
            ? 'border-fei-yellow bg-fei-yellow text-fei-bg'
            : 'border-fei-bg/15 bg-white text-transparent group-hover:border-fei-sky/60'
        }`}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m7 12 3 3 7-7" />
        </svg>
      </span>
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

function AudioPlayer({
  script,
  itemId,
  audioSrc,
  minimal = false,
}: {
  script: string
  itemId: string
  audioSrc?: string
  minimal?: boolean
}) {
  const [playCount, setPlayCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    setPlayCount(0)
    setPlaying(false)

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
    }
  }, [itemId, audioSrc])

  function handlePlay() {
    if (playing || playCount >= 2) return

    if (audioSrc) {
      const audio = new Audio(audioSrc)
      audioRef.current = audio

      audio.onended = () => {
        setPlaying(false)
        audioRef.current = null
      }

      audio.onerror = () => {
        console.error(`FEI diagnostic audio could not be played: ${audioSrc}`)
        setPlaying(false)
        audioRef.current = null
      }

      setPlaying(true)

      audio.play()
        .then(() => {
          setPlayCount((count) => count + 1)
        })
        .catch((error) => {
          console.error('FEI diagnostic audio playback error:', error)
          setPlaying(false)
          audioRef.current = null
        })

      return
    }

    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => {
      setPlaying(true)
      setPlayCount((count) => count + 1)
    }
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const limitReached = playCount >= 2

  return (
    <div
      className={
        minimal
          ? 'rounded-xl border border-fei-bg/[0.09] bg-white px-5 py-4 sm:px-6'
          : 'border-y border-fei-bg/10 py-6'
      }
    >
      <div className={minimal ? 'mb-2 flex items-center gap-2' : 'mb-4 flex items-center gap-2'}>
        <div className="h-2 w-2 rounded-full bg-fei-sky" />
        <span
          className={
            minimal
              ? 'text-[11px] font-medium uppercase tracking-[0.08em] text-fei-bg/42'
              : 'text-xs font-black uppercase tracking-[0.22em] text-fei-bg/48'
          }
        >
          Audio
        </span>
        {playCount === 1 && (
          <span className="text-xs text-fei-bg/45">— 1 replay remaining</span>
        )}
        {limitReached && (
          <span className="text-xs text-fei-bg/45">— Listening limit reached</span>
        )}
      </div>

      <p
        className={
          minimal
            ? 'mb-3 text-xs leading-5 text-fei-bg/48'
            : 'mb-5 text-sm leading-6 text-fei-bg/55'
        }
      >
        Click play to hear the audio clip. You may listen up to 2 times.
      </p>

      <button
        type="button"
        onClick={handlePlay}
        disabled={playing || limitReached}
        className={
          minimal
            ? 'inline-flex min-h-10 items-center gap-2 rounded-full border border-fei-bg/[0.12] bg-fei-sky/[0.06] px-4 py-2.5 text-sm font-semibold text-fei-bg transition hover:border-fei-sky/35 hover:bg-fei-sky/[0.1] disabled:cursor-not-allowed disabled:opacity-50'
            : 'inline-flex min-h-12 items-center gap-2 rounded-full border border-fei-sky/45 bg-fei-sky/[0.08] px-6 py-3 text-sm font-bold text-fei-bg transition hover:border-fei-sky/70 hover:bg-fei-sky/[0.13] disabled:cursor-not-allowed disabled:opacity-50'
        }
      >
        {playing ? (
          <>
            <span className="flex h-3 w-3 items-center gap-0.5">
              <span className="block h-3 w-0.5 animate-pulse bg-fei-bg" />
              <span
                className="block h-2 w-0.5 animate-pulse bg-fei-bg"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className="block h-3 w-0.5 animate-pulse bg-fei-bg"
                style={{ animationDelay: '0.2s' }}
              />
            </span>
            Playing...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {limitReached
              ? 'Listening complete'
              : playCount === 1
                ? 'Play again'
                : 'Play audio'}
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
  const assessmentAvailable = selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Academy Director' || selectedRole === 'Head of Scouting' || selectedRole === 'Scout' || selectedRole === 'Fitness Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Nutritionist' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist'
  const activeItems = selectedRole === 'Head Coach' ? headCoachItems : selectedRole === 'Assistant Coach' ? assistantCoachItems : selectedRole === 'Academy Director' ? academyDirectorItems : selectedRole === 'Head of Scouting' ? headOfScoutingItems : selectedRole === 'Scout' ? scoutItems : selectedRole === 'Fitness Coach' ? fitnessCoachItems : selectedRole === 'Performance Analyst' ? performanceAnalystItems : selectedRole === 'Nutritionist' ? nutritionistItems : selectedRole === 'Physiotherapist' ? physiotherapistItems : selectedRole === 'Sports Psychologist' ? sportsPsychologistItems : items
  const roleSubtitle = selectedRole === 'Academy Director' ? 'Youth & Academy' : selectedRole === 'Head of Scouting' ? 'Recruitment Leadership' : selectedRole === 'Scout' ? 'First Team Recruitment' : selectedRole === 'Fitness Coach' ? 'Strength & Conditioning' : selectedRole === 'Performance Analyst' ? 'First Team Analysis' : selectedRole === 'Nutritionist' ? 'Performance Nutrition' : selectedRole === 'Physiotherapist' ? 'Medical & Rehabilitation' : selectedRole === 'Sports Psychologist' ? 'Mental Performance' : selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' ? 'First Team' : 'Senior Squad'

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
  const [animatedEvidence, setAnimatedEvidence] = useState(0)
  const resultStorageKey = `fei-diagnostic-result:${selectedRole}`

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const totalItems = 17

  useEffect(() => {
    try {
      const savedResult = window.localStorage.getItem(resultStorageKey)

      if (!savedResult) return

      const parsedResult = JSON.parse(savedResult) as {
        role: string
        result: Result
      }

      if (
        parsedResult.role === selectedRole &&
        parsedResult.result &&
        typeof parsedResult.result.score === 'number' &&
        typeof parsedResult.result.maxScore === 'number' &&
        typeof parsedResult.result.level === 'string'
      ) {
        setResult(parsedResult.result)
        setSection('result')
      }
    } catch (error) {
      console.error('FEI saved diagnostic result could not be restored:', error)
      window.localStorage.removeItem(resultStorageKey)
    }
  }, [resultStorageKey, selectedRole])

  useEffect(() => {
    if (section !== 'result' || !result) {
      setAnimatedEvidence(0)
      return
    }

    const targetEvidence = Math.round(
      (result.score / result.maxScore) * 100
    )

    if (targetEvidence <= 0) {
      setAnimatedEvidence(0)
      return
    }

    setAnimatedEvidence(0)

    const initialPause = 180
    const countingDuration = 1820
    const stepDuration = countingDuration / targetEvidence
    let currentValue = 0
    let interval: number | undefined

    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        currentValue += 1
        setAnimatedEvidence(currentValue)

        if (currentValue >= targetEvidence && interval) {
          window.clearInterval(interval)
        }
      }, stepDuration)
    }, initialPause)

    return () => {
      window.clearTimeout(timeout)

      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [section, result])

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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

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
    const fitnessCoachKeywords = ['load', 'fitness', 'fatigue', 'recovery', 'threshold', 'volume', 'intensity', 'availability', 'risk', 'readiness']
    const performanceAnalystKeywords = ['analysis', 'data', 'video', 'pattern', 'press', 'transition', 'opponent', 'space', 'evidence', 'tactical']
    const nutritionistKeywords = ['nutrition', 'fueling', 'hydration', 'recovery', 'carbohydrate', 'protein', 'glycogen', 'meal', 'timing', 'performance']
    const physiotherapistKeywords = ['injury', 'rehab', 'rehabilitation', 'pain', 'strength', 'agility', 'confidence', 'return', 'play', 'risk']
    const sportsPsychologistKeywords = ['confidence', 'pressure', 'anxiety', 'resilience', 'support', 'mistakes', 'performance', 'psychology', 'mental', 'coach']

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
                : selectedRole === 'Fitness Coach'
                  ? fitnessCoachKeywords
                  : selectedRole === 'Performance Analyst'
                    ? performanceAnalystKeywords
                    : selectedRole === 'Nutritionist'
                      ? nutritionistKeywords
                      : selectedRole === 'Physiotherapist'
                        ? physiotherapistKeywords
                        : selectedRole === 'Sports Psychologist'
                          ? sportsPsychologistKeywords
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('FEI assessment user error:', userError)
    }

    if (!user) {
      console.error('FEI assessment was not saved because there is no authenticated user.')
    } else {
      const { error: saveError } = await supabase.from('assessment_history').insert({
        user_id: user.id,
        role: selectedRole,
        score: Math.round((res.score / res.maxScore) * 100),
        level: res.level,
        completed_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error('FEI assessment save error:', saveError)
      } else {
        console.log('FEI assessment saved successfully.')
      }
    }

    try {
      window.localStorage.setItem(
        resultStorageKey,
        JSON.stringify({
          role: selectedRole,
          result: res,
        })
      )
    } catch (error) {
      console.error('FEI diagnostic result could not be saved locally:', error)
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
    const audio = new Audio('/audio/audio-check.mp3')

    setAudioTestPlaying(true)

    audio.onended = () => {
      setAudioTestPlaying(false)
    }

    audio.onerror = () => {
      console.error('FEI audio check could not be played.')
      setAudioTestPlaying(false)
    }

    audio.play().catch((error) => {
      console.error('FEI audio check playback error:', error)
      setAudioTestPlaying(false)
    })
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
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-8 w-auto" />
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
      <div className="relative min-h-screen overflow-x-hidden bg-[#FAFBFC] text-fei-bg">
        <div
          className="pointer-events-none absolute right-[-10rem] top-[5rem] h-[520px] w-[620px] opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 65% 35%, rgba(125,211,252,0.18), transparent 65%)',
          }}
        />

        <header className="sticky top-0 z-50 border-b border-fei-bg/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center px-6 sm:px-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex items-center"
              aria-label="Return to dashboard"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-12 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>
          </div>
        </header>

        <main className="relative mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1280px] items-start px-6 py-5 sm:px-8 lg:py-6">
          <div className="mt-5 w-full">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-fei-bg/50 sm:mb-5">
              Diagnostic Assessment
            </p>

            <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
              <section className="flex flex-col px-2 py-3 sm:px-4 sm:py-5 lg:px-8 lg:py-6">
                <div className="border-l-4 border-fei-sky pl-5 sm:pl-6">
                  <h1 className="text-4xl font-black tracking-[-0.04em] text-fei-bg sm:text-5xl lg:text-6xl">
                    {selectedRole}
                  </h1>

                  <p className="mt-4 text-base font-semibold text-fei-bg/58">
                    {roleSubtitle}
                  </p>

                  <p className="mt-6 max-w-lg text-[15px] leading-7 text-fei-bg/62 sm:text-base sm:leading-8">
                    Discover how you understand and use English in real football situations connected to your role.
                  </p>
                </div>

                <div className="mt-10 border-t border-fei-bg/10 pt-7">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-fei-bg/45">
                    Assessment overview
                  </p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-center gap-4 sm:border-r sm:border-fei-bg/10 sm:pr-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-fei-sky/40 bg-white text-fei-bg shadow-[0_8px_24px_rgba(7,17,31,0.05)]">
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

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fei-bg/45">
                          Duration
                        </p>
                        <p className="mt-1.5 text-base text-fei-bg/70">
                          10–12 minutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-fei-sky/40 bg-white text-fei-bg shadow-[0_8px_24px_rgba(7,17,31,0.05)]">
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

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fei-bg/45">
                          What you’ll receive
                        </p>
                        <p className="mt-1.5 text-base text-fei-bg/70">
                          Level and next steps
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              <div className="grid gap-4 lg:-mt-10">
                <section className="rounded-[1.75rem] border border-fei-bg/[0.16] bg-white p-6 shadow-[0_22px_60px_rgba(7,17,31,0.10)] sm:p-7 lg:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-fei-bg/48">
                    Before you begin
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      'Do not close or refresh the page until the assessment is complete.',
                      'Find a quiet place with a reliable internet connection.',
                    ].map((item, index) => (
                      <div key={item} className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-fei-sky/50 bg-fei-sky/[0.10] text-xs font-black text-fei-bg">
                          {index + 1}
                        </span>

                        <p className="pt-0.5 text-[14px] leading-6 text-fei-bg/68 sm:text-[15px]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[1.75rem] border border-fei-bg/[0.16] bg-white p-6 shadow-[0_22px_60px_rgba(7,17,31,0.10)] sm:p-7 lg:p-8">
                  <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent" />

                  <p className="text-xs font-black uppercase tracking-[0.3em] text-fei-bg/48">
                    Audio & microphone check
                  </p>

                  <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-fei-bg sm:text-4xl">
                    Check your setup
                  </h2>

                  <p className="mt-3 max-w-xl text-[15px] leading-7 text-fei-bg/60">
                    Check your audio and enable your microphone before starting the diagnostic.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={playAudioTest}
                      disabled={audioTestPlaying}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-fei-sky/50 bg-fei-sky/[0.06] px-5 py-3 text-sm font-bold text-fei-bg transition hover:-translate-y-0.5 hover:border-fei-sky/70 hover:bg-fei-sky/[0.11] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {audioTestPlaying ? 'Playing...' : 'Play test audio'}
                    </button>

                    {micPermission === 'granted' ? (
                      <div className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.08] px-5 py-3 text-sm font-bold text-green-700">
                        ✓ Microphone ready
                      </div>
                    ) : micPermission === 'denied' ? (
                      <button
                        type="button"
                        onClick={requestMic}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/[0.06] px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-500/10"
                      >
                        Microphone access denied
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={requestMic}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-fei-yellow px-5 py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
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

                  {micPermission === 'denied' && (
                    <p className="mt-3 text-sm leading-6 text-red-700">
                      Please allow microphone access in your browser settings and refresh the page.
                    </p>
                  )}
                </section>

                <button
                  type="button"
                  onClick={() => {
                    if (micPermission !== 'granted') return
                    setSection('warm-up')
                  }}
                  disabled={micPermission !== 'granted'}
                  className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-fei-yellow px-8 py-4 text-base font-black text-fei-bg transition duration-300 hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  <span className="inline-flex items-center gap-2">
                    Begin assessment
                    <ChevronRightIcon />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // WARM-UP
  if (section === 'warm-up') {
    const item = activeItems.warmup[warmupStep]
    const selected = answers[item.id]
    const currentItem = getItemNumber('warm-up', warmupStep)
    const progress = Math.round((currentItem / totalItems) * 100)

    return (
      <div className="min-h-screen bg-[#F6F7F9] text-fei-bg">
        <header className="border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center justify-between px-6 sm:px-8">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-9 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
                Diagnostic assessment
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-6 py-8 sm:px-8 lg:py-10">
          <div className="mb-10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-fei-bg/55">
                Item {currentItem} of {totalItems}
              </p>

              <p className="text-sm font-bold text-fei-bg">
                {progress}%
              </p>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-fei-bg/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fei-yellow to-fei-sky transition-all duration-500"
                style={{ width: `${(currentItem / totalItems) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12">
            <aside className="lg:sticky lg:top-10">
              <div className="h-1 w-20 rounded-full bg-fei-sky" />

              <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-fei-bg/45">
                Role Warm-Up
              </p>

            </aside>

            <section>
              <div className="border-l-4 border-fei-sky pl-5 sm:pl-7">
                <h1 className="max-w-3xl text-3xl font-black leading-[1.15] tracking-[-0.035em] text-fei-bg sm:text-4xl">
                  {item.context}
                </h1>

                <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-fei-bg/72 sm:text-lg">
                  {item.question}
                </p>
              </div>

              <div className="mt-9 overflow-hidden border-y border-fei-bg/10">
                {item.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected === option}
                    onClick={() => setAnswer(item.id, option)}
                    className={`group flex w-full items-center justify-between gap-5 border-b border-fei-bg/10 px-1 py-5 text-left transition last:border-b-0 sm:px-3 sm:py-6 ${
                      selected === option
                        ? 'bg-fei-sky/[0.09]'
                        : 'hover:bg-white/75'
                    }`}
                  >
                    <span
                      className={`text-[15px] font-normal leading-7 transition sm:text-base ${
                        selected === option
                          ? 'text-fei-bg'
                          : 'text-fei-bg/68 group-hover:text-fei-bg'
                      }`}
                    >
                      {option}
                    </span>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                        selected === option
                          ? 'border-fei-yellow bg-fei-yellow text-fei-bg'
                          : 'border-fei-bg/15 bg-white text-transparent group-hover:border-fei-sky/60'
                      }`}
                      aria-hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m7 12 3 3 7-7" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return
                    if (warmupStep < activeItems.warmup.length - 1) {
                      setWarmupStep(warmupStep + 1)
                    } else {
                      setSection('reading')
                    }
                  }}
                  disabled={!selected}
                  className="inline-flex min-h-[56px] min-w-[250px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 text-base font-black text-fei-bg transition duration-300 hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  {!selected ? (
                    'Select an option to continue'
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      {warmupStep < activeItems.warmup.length - 1
                        ? 'Next'
                        : 'Continue to Reading'}
                      <ChevronRightIcon />
                    </span>
                  )}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  // READING
  if (section === 'reading') {
    const item = activeItems.reading[readingStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-[#F6F7F9] px-6 py-5 text-fei-bg sm:px-8 lg:py-6">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-5 flex min-h-[48px] items-center justify-between border-b border-fei-bg/[0.08] pb-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar
            current={getItemNumber('reading', readingStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              selectedRole === 'Professional Player'
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              <SectionBadge label="Professional Reading" />
            </aside>

            <section className={selectedRole === 'Professional Player' ? 'max-w-[840px]' : undefined}>
              {selectedRole === 'Professional Player' ? (
                <>
                  <div className="mb-4 rounded-xl border border-fei-bg/[0.09] bg-white">
                    <div className="border-l-2 border-fei-sky px-5 py-4 sm:px-6">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-fei-bg/40">
                        {item.context.split('\n\n')[0]}
                      </p>

                      <p className="max-w-[760px] whitespace-pre-line text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72 select-none sm:text-base">
                        {item.context.split('\n\n').slice(1).join('\n\n')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-base font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-[1.04rem]">
                      {item.question}
                    </h1>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 rounded-[1.25rem] border border-fei-bg/[0.14] bg-white p-5 sm:p-6">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45">
                      Read carefully
                    </p>

                    <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-fei-bg/72 select-none sm:text-base">
                      {item.context}
                    </p>
                  </div>

                  <div className="mb-5 border-l-4 border-fei-sky pl-5 sm:pl-6">
                    <h1 className="text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl">
                      {item.question}
                    </h1>
                  </div>
                </>
              )}

              <div className="mb-4 overflow-hidden border-y border-fei-bg/[0.08]">
                {item.options.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={selected === option}
                    onSelect={() => setAnswer(item.id, option)}
                    refined={selectedRole === 'Professional Player'}
                  />
                ))}
              </div>

              <div className={`flex justify-end ${
                selectedRole === 'Professional Player' ? 'pb-6' : ''
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return
                    if (readingStep < activeItems.reading.length - 1) {
                      setReadingStep(readingStep + 1)
                    } else {
                      setSection('listening')
                    }
                  }}
                  disabled={!selected}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  {!selected ? (
                    'Select an option to continue'
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      {readingStep < activeItems.reading.length - 1
                        ? 'Next'
                        : 'Continue to Listening'}
                      <ChevronRightIcon />
                    </span>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // LISTENING
  if (section === 'listening') {
    const item = activeItems.listening[listeningStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-[#F6F7F9] px-6 py-5 text-fei-bg sm:px-8 lg:py-6">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-5 flex min-h-[48px] items-center justify-between border-b border-fei-bg/[0.08] pb-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar
            current={getItemNumber('listening', listeningStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              selectedRole === 'Professional Player'
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              <SectionBadge label="Listening in Context" />

              <p className="mt-3 max-w-xs text-sm leading-6 text-fei-bg/55">
                Use headphones for best results.
              </p>
            </aside>

            <section
              className={
                selectedRole === 'Professional Player'
                  ? 'max-w-[840px]'
                  : undefined
              }
            >
              <div className="mb-5">
                <AudioPlayer
                  script={item.script}
                  itemId={item.id}
                  audioSrc={
                    selectedRole === 'Professional Player'
                      ? `/audio/diagnostics/professional-player/professional-player-listening-${listeningStep + 1}.mp3`
                      : undefined
                  }
                  minimal={selectedRole === 'Professional Player'}
                />
              </div>

              <div
                className={
                  selectedRole === 'Professional Player'
                    ? 'mb-3'
                    : 'mb-5 border-l-4 border-fei-sky pl-5 sm:pl-6'
                }
              >
                <h1
                  className={
                    selectedRole === 'Professional Player'
                      ? 'max-w-[780px] text-base font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-[1.04rem]'
                      : 'text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl'
                  }
                >
                  {item.question}
                </h1>
              </div>

              <div className="mb-5 overflow-hidden border-y border-fei-bg/10">
                {item.options.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={selected === option}
                    onSelect={() => setAnswer(item.id, option)}
                    refined={selectedRole === 'Professional Player'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  selectedRole === 'Professional Player' ? 'pb-6' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return

                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel()
                    }

                    if (listeningStep < activeItems.listening.length - 1) {
                      setListeningStep(listeningStep + 1)
                    } else {
                      setSection('vocabulary')
                    }
                  }}
                  disabled={!selected}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  {!selected ? (
                    'Select an option to continue'
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      {listeningStep < activeItems.listening.length - 1
                        ? 'Next'
                        : 'Continue to Vocabulary'}
                      <ChevronRightIcon />
                    </span>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // VOCABULARY
  if (section === 'vocabulary') {
    const item = activeItems.vocabulary[vocabStep]
    const selected = answers[item.id]

    const vocabularySpeaker = item.context.toLowerCase().includes('physiotherapist')
      ? 'Physiotherapist'
      : item.context.toLowerCase().includes('coach')
        ? 'Coach'
        : item.context.toLowerCase().includes('teammate')
          ? 'Teammate'
          : 'Match context'

    const vocabularyQuoteMatch = item.context.match(/[“"](.+)[”"]$/)
    const vocabularyQuote = vocabularyQuoteMatch?.[1] ?? item.context

    const vocabularySetup = item.context
      .replace(
        /\s*(?:A teammate shouts|The coach says|The physiotherapist asks):\s*[“"].*[”"]$/,
        '',
      )
      .trim()

    return (
      <div
        className={`min-h-screen bg-[#F6F7F9] px-6 text-fei-bg sm:px-8 ${
          selectedRole === 'Professional Player'
            ? 'py-5 lg:py-6'
            : 'py-8 lg:py-10'
        }`}
      >
        <div className="mx-auto max-w-[1080px]">
          <div
            className={`flex items-center justify-between border-b border-fei-bg/[0.08] ${
              selectedRole === 'Professional Player'
                ? 'mb-5 min-h-[48px] pb-3'
                : 'mb-8 min-h-[52px] pb-5'
            }`}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar
            current={getItemNumber('vocabulary', vocabStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              selectedRole === 'Professional Player'
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              <SectionBadge label="Football Vocabulary" />
            </aside>

            <section
              className={
                selectedRole === 'Professional Player'
                  ? 'max-w-[840px]'
                  : undefined
              }
            >
              {selectedRole === 'Professional Player' ? (
                <>
                  <div className="mb-4">
                    {vocabularySetup && (
                      <p className="mb-2 max-w-[720px] text-sm leading-6 text-fei-bg/52">
                        {vocabularySetup}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-white shadow-[0_5px_16px_rgba(15,23,42,0.08)] ${
                          vocabularySpeaker === 'Physiotherapist'
                            ? 'border-emerald-500/25'
                            : vocabularySpeaker === 'Coach'
                              ? 'border-fei-yellow/45'
                              : 'border-fei-sky/35'
                        }`}
                      >
                        <img
                          src={
                            vocabularySpeaker === 'Physiotherapist'
                              ? '/images/diagnostics/avatars/physiotherapist.png'
                              : vocabularySpeaker === 'Coach'
                                ? '/images/diagnostics/avatars/coach.png'
                                : '/images/diagnostics/avatars/teammate.png'
                          }
                          alt={`${vocabularySpeaker} avatar`}
                          loading="eager"
                          decoding="sync"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="relative max-w-[720px] rounded-2xl border border-fei-bg/[0.09] bg-white px-5 py-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] sm:px-6">
                        <span
                          className="absolute left-[-7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b border-l border-fei-bg/[0.09] bg-white"
                          aria-hidden="true"
                        />

                        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.07em] text-fei-bg/38">
                          {vocabularySpeaker}
                        </p>

                        <p className="text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/74 select-none sm:text-base">
                          “{vocabularyQuote}”
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-base font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-[1.04rem]">
                      {item.question}
                    </h1>
                  </div>
                </>
              ) : (
                <div className="mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7">
                  <p className="text-base leading-8 text-fei-bg/70 select-none">
                    {item.context}
                  </p>

                  <h1 className="mt-6 text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl">
                    {item.question}
                  </h1>
                </div>
              )}

              <div className="mb-8 overflow-hidden border-y border-fei-bg/10">
                {item.options.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={selected === option}
                    onSelect={() => setAnswer(item.id, option)}
                    refined={selectedRole === 'Professional Player'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  selectedRole === 'Professional Player' ? 'pb-6' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return
                    if (vocabStep < activeItems.vocabulary.length - 1) {
                      setVocabStep(vocabStep + 1)
                    } else {
                      setSection('functional')
                    }
                  }}
                  disabled={!selected}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  {!selected ? (
                    'Select an option to continue'
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      {vocabStep < activeItems.vocabulary.length - 1
                        ? 'Next'
                        : 'Continue to Functional Communication'}
                      <ChevronRightIcon />
                    </span>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // FUNCTIONAL COMMUNICATION
  if (section === 'functional') {
    const item = activeItems.functional[functionalStep]
    const selected = answers[item.id]

    return (
      <div
        className={`min-h-screen bg-[#F6F7F9] px-6 text-fei-bg sm:px-8 ${
          selectedRole === 'Professional Player'
            ? 'py-5 lg:py-6'
            : 'py-8 lg:py-10'
        }`}
      >
        <div className="mx-auto max-w-[1080px]">
          <div
            className={`flex items-center justify-between border-b border-fei-bg/[0.08] ${
              selectedRole === 'Professional Player'
                ? 'mb-5 min-h-[48px] pb-3'
                : 'mb-8 min-h-[52px] pb-5'
            }`}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar
            current={getItemNumber('functional', functionalStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              selectedRole === 'Professional Player'
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              <SectionBadge label="Functional Communication" />
            </aside>

            <section
              className={
                selectedRole === 'Professional Player'
                  ? 'max-w-[840px]'
                  : undefined
              }
            >
              {selectedRole === 'Professional Player' ? (
                <>
                  <div className="mb-4 rounded-xl border border-fei-bg/[0.09] bg-white">
                    <div className="border-l-2 border-fei-sky px-5 py-4 sm:px-6">
                      <p className="max-w-[760px] text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72 select-none sm:text-base">
                        {item.context}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-base font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-[1.04rem]">
                      {item.question}
                    </h1>
                  </div>
                </>
              ) : (
                <div className="mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7">
                  <p className="text-base leading-8 text-fei-bg/70 select-none">
                    {item.context}
                  </p>

                  <h1 className="mt-6 text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl">
                    {item.question}
                  </h1>
                </div>
              )}

              <div className="mb-8 overflow-hidden border-y border-fei-bg/10">
                {item.options.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={selected === option}
                    onSelect={() => setAnswer(item.id, option)}
                    refined={selectedRole === 'Professional Player'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  selectedRole === 'Professional Player' ? 'pb-6' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return
                    if (functionalStep < activeItems.functional.length - 1) {
                      setFunctionalStep(functionalStep + 1)
                    } else {
                      setSection('writing')
                    }
                  }}
                  disabled={!selected}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  {!selected ? (
                    'Select an option to continue'
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      {functionalStep < activeItems.functional.length - 1
                        ? 'Next'
                        : 'Continue to Writing'}
                      <ChevronRightIcon />
                    </span>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // WRITING
  if (section === 'writing') {
    const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0

    return (
      <div className="min-h-screen bg-[#F6F7F9] px-6 py-8 text-fei-bg sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex min-h-[52px] items-center justify-between border-b border-fei-bg/[0.08] pb-5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar current={16} total={totalItems} />

          <div className="mb-8">
            <SectionBadge label="Written Production" />
          </div>

          <div className="mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45">Situation</p>
            <p className="mt-5 text-base leading-8 text-fei-bg/70">
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
                        : selectedRole === 'Fitness Coach'
                          ? 'You need to write a short weekly load report for the coaching staff. The squad average is 8.3 km, weekly load is up 3%, three players show emerging fatigue, and Friday volume may need to be reduced before the match.'
                          : selectedRole === 'Performance Analyst'
                            ? 'You need to write a short opposition analysis memo for the coaching staff. The opponent uses a high line, a sweeping goalkeeper, compact midfield pressing and aggressive fullbacks.'
                            : selectedRole === 'Nutritionist'
                              ? 'You need to write a short match-day nutrition guide for a player. Include breakfast, pre-match fueling, hydration or electrolytes, half-time support and post-match recovery.'
                              : selectedRole === 'Physiotherapist'
                                ? 'You need to write a short rehabilitation progress note for the coaching staff. The player is in Week 3. Strength is 70%, pain is 2/10 with activity, agility is 55%, and confidence is improving after the first sprint without hesitation.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'You need to write a short mental performance note for the coaching staff. The player is dealing with perfectionism, anxiety before matches and reduced confidence after mistakes.'
                                  : "After training today, you developed tightness in your left hamstring during the second half. It started when you made a sharp turning movement while sprinting. The sensation increased slightly during the cool-down. You want to report this to the physiotherapist before tomorrow's session."}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xl font-black leading-8 text-fei-bg">
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
                        : selectedRole === 'Fitness Coach'
                          ? 'Write 3–5 sentences with the key load finding and recommendation.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Write 3–5 sentences with the main tactical risk and recommended response.'
                            : selectedRole === 'Nutritionist'
                              ? 'Write 3–5 sentences with breakfast, pre-match fueling, hydration, half-time support and post-match recovery.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Write 3–5 sentences with status, next step and expected return direction.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Write 3–5 sentences with the key issue, strategy and coaching support needed.'
                                  : 'Write a message to the physiotherapist reporting this discomfort.'}
            </p>
            <p className="mt-3 text-sm leading-6 text-fei-bg/55">Write 3–5 sentences in professional English.</p>
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="Hi, I wanted to report..."
            rows={6}
            className="mb-2 w-full resize-none rounded-2xl border border-fei-bg/15 bg-white px-5 py-4 text-base leading-7 text-fei-bg placeholder:text-fei-bg/25 focus:border-fei-sky focus:outline-none"
          />
          <div className="mb-8 flex items-center justify-between text-xs text-fei-bg/45">
            <span>{wordCount} words</span>
            <span>Target: 30–80 words</span>
          </div>

          <button
            onClick={() => setSection('speaking')}
            className="ml-auto flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30 disabled:opacity-100"
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
      <div className="min-h-screen bg-[#F6F7F9] px-6 py-8 text-fei-bg sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex min-h-[52px] items-center justify-between border-b border-fei-bg/[0.08] pb-5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-10 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/45 sm:text-sm">
              Diagnostic Assessment
            </p>
          </div>

          <ProgressBar current={17} total={totalItems} />

          <div className="mb-8">
            <SectionBadge label="Speaking Production" />
          </div>

          <div className="mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45">Situation</p>
            <p className="mt-5 text-base leading-8 text-fei-bg/70">
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
                        : selectedRole === 'Fitness Coach'
                          ? 'You need to explain your load position to the head coach. The match is important, current load is close to threshold, and you need to protect performance without sounding negative or overly cautious.'
                          : selectedRole === 'Performance Analyst'
                            ? 'You need to explain a player analysis to the coaching staff. The player has strong passing numbers, good spatial awareness and quick decisions when free, but his execution drops under pressure.'
                            : selectedRole === 'Nutritionist'
                              ? 'You need to explain to a player why you are adjusting his fueling plan. He has been reporting fatigue late in matches, and his hydration and pre-training timing are inconsistent.'
                              : selectedRole === 'Physiotherapist'
                                ? 'You need to explain a return-to-play recommendation to the head coach. The player is improving, but you need to balance strength, movement testing, confidence and match availability.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'You need to explain to the head coach how to support a player whose perfectionism is creating pre-match anxiety and lower confidence after mistakes.'
                                  : 'You have just received feedback from the head coach about your last match. The coach said you were too slow in transition and needed to be more aggressive in pressing. You disagree slightly because the transition was fast and you were managing some discomfort.'}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xl font-black leading-8 text-fei-bg">
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
                        : selectedRole === 'Fitness Coach'
                          ? 'Explain your load recommendation clearly, balancing match performance, risk, and availability.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Explain the analysis clearly, separating technical quality from pressure execution and giving a coachable next step.'
                            : selectedRole === 'Nutritionist'
                              ? 'Explain the adjustment clearly, linking timing, hydration, energy and realistic behavior change.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Explain the recommendation clearly, balancing medical reality, team need, confidence and risk.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Explain the support strategy clearly, balancing confidence, standards, anxiety and sustainable performance.'
                                  : 'Explain how you would respond to the coach professionally.'}
            </p>
            <p className="mt-3 text-sm leading-6 text-fei-bg/55">Recommended time: 45–60 seconds. Recording stops automatically at 75 seconds.</p>
          </div>

          {isRecording && (
            <div className="mb-6 rounded-2xl border border-red-500/25 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-600">Recording...</span>
                <span className="ml-auto text-sm font-bold text-red-600">{recordingTime}s</span>
              </div>
              <div className="h-2 w-full rounded-full bg-fei-bg/10">
                <div
                  className="h-2 rounded-full bg-red-500 transition-all"
                  style={{ width: `${(recordingTime / 75) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-fei-bg/45">
                {recordingTime < 45 ? 'Recommended minimum: 45 seconds. You can stop anytime.' : recordingTime < 60 ? 'Good length — you can continue' : 'Consider wrapping up.'}
              </p>
            </div>
          )}

          {recordingDone && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-center ${
                recordingTime < 45
                  ? 'border-fei-yellow/20 bg-fei-yellow/[0.045]'
                  : 'border-green-500/15 bg-green-500/[0.035]'
              }`}
            >
              <p className={`text-xs font-semibold ${recordingTime < 45 ? 'text-fei-bg/65' : 'text-green-700'}`}>
                {recordingTime < 45 ? `Recording saved · ${recordingTime}s` : `✓ Recording saved · ${recordingTime}s`}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-fei-bg/42">
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
                className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-red-500 px-8 py-3.5 font-bold text-white transition hover:bg-red-600"
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
                className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 bg-white px-8 py-3.5 font-bold text-red-600 transition hover:bg-red-500/[0.06]"
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
                className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-fei-bg/15 bg-white px-5 py-2.5 text-sm font-medium text-fei-bg/65 transition hover:border-fei-sky/50 hover:text-fei-bg"
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
              className="mt-5 w-full text-center text-xs text-fei-bg/35 transition hover:text-fei-bg/55"
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
              : selectedRole === 'Sports Psychologist'
                ? {
                    A2: 'You understand basic mental-performance communication. Your pathway will build confidence in check-ins, support language and simple pressure-management tools.',
                    B1: 'You can support common confidence and pressure situations. Your pathway will strengthen structure, emotional precision and player-centered communication.',
                    B2: 'You communicate psychological support with clarity and professionalism. Your pathway will develop advanced resilience, injury psychology and coach-facing communication.',
                    C1: 'You manage complex mental-performance communication with strategic care. Your pathway will refine multi-stakeholder alignment, confidentiality and high-pressure support.',
                  }
                : selectedRole === 'Physiotherapist'
                ? {
                    A2: 'You understand basic injury and rehabilitation information. Your pathway will build confidence in explaining status, treatment and simple return-to-play decisions.',
                    B1: 'You can communicate common medical updates and basic rehab plans. Your pathway will strengthen precision, risk explanation and player-coach communication.',
                    B2: 'You communicate injury status and rehabilitation progress with professional clarity. Your pathway will develop complex return-to-play, confidence and multidisciplinary communication.',
                    C1: 'You manage complex medical communication with precision, care and strategic judgment. Your pathway will refine high-stakes return-to-play and stakeholder alignment.',
                  }
                : selectedRole === 'Nutritionist'
                ? {
                    A2: 'You understand basic nutrition and recovery instructions. Your pathway will build confidence in explaining fueling, hydration and recovery routines.',
                    B1: 'You can communicate common nutrition plans. Your pathway will strengthen timing, personalization and practical player behavior change.',
                    B2: 'You explain performance nutrition decisions with professional clarity. Your pathway will develop cultural adaptation, adherence strategy and high-pressure player communication.',
                    C1: 'You manage complex nutrition communication with precision and strategic awareness. Your pathway will refine multi-stakeholder decisions and long-term performance planning.',
                  }
                : selectedRole === 'Performance Analyst'
                ? {
                    A2: 'You understand basic analysis information and key tactical terms. Your pathway will build confidence in explaining patterns clearly.',
                    B1: 'You can communicate common analysis points. Your pathway will strengthen evidence structure and tactical explanation.',
                    B2: 'You present analysis with clarity and professional logic. Your pathway will develop influence, pressure communication, and advanced interpretation.',
                    C1: 'You demonstrate strategic analysis communication. Your pathway will refine multi-stakeholder interpretation and high-level tactical influence.',
                  }
                : selectedRole === 'Fitness Coach'
                ? {
                    A2: 'You understand basic fitness and recovery information. Your pathway will build confidence in explaining load, readiness, and simple risk decisions.',
                    B1: 'You can communicate common load and recovery decisions. Your pathway will strengthen structure, data explanation, and coach-facing clarity.',
                    B2: 'You communicate workload and availability with professional clarity. Your pathway will develop pressure communication, risk framing, and strategic influence.',
                    C1: 'You demonstrate strategic performance communication. Your pathway will refine institutional influence, availability planning, and high-stakes load decisions.',
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
              : selectedRole === 'Sports Psychologist'
                ? {
                    A2: 'Your result shows that you understand basic mental-performance communication. Your next step is to build confidence in check-ins, support language and simple pressure-management tools.',
                    B1: 'Your result shows that you can support common confidence and pressure situations. Your next step is to strengthen structure, emotional precision and player-centered communication.',
                    B2: 'Your result shows strong professional communication around psychological support. Your next step is to develop advanced resilience language, injury psychology communication and coach-facing strategies.',
                    C1: 'Your result shows complex mental-performance communication with strategic care. Your next step is refinement: multi-stakeholder alignment, confidentiality boundaries and high-pressure support.',
                  }
                : selectedRole === 'Physiotherapist'
                ? {
                    A2: 'Your result shows that you understand basic injury and rehabilitation information. Your next step is to build confidence explaining status, treatment and simple return-to-play decisions in clear football language.',
                    B1: 'Your result shows that you can communicate common medical updates and basic rehab plans. Your next step is to strengthen precision, risk explanation and player-coach communication.',
                    B2: 'Your result shows strong professional communication around injury status and rehabilitation progress. Your next step is to develop complex return-to-play, confidence and multidisciplinary communication.',
                    C1: 'Your result shows complex medical communication with precision, care and strategic judgment. Your next step is refinement: high-stakes return-to-play decisions, stakeholder alignment and clinically mature communication under pressure.',
                  }
                : selectedRole === 'Nutritionist'
                ? {
                    A2: 'Your result shows that you understand basic nutrition and recovery instructions. Your next step is to build confidence explaining fueling, hydration and recovery routines in simple football situations.',
                    B1: 'Your result shows that you can communicate common nutrition plans. Your next step is to strengthen timing, personalization and practical player behavior-change language.',
                    B2: 'Your result shows strong professional communication around performance nutrition decisions. Your next step is to develop cultural adaptation, adherence strategy and high-pressure player communication.',
                    C1: 'Your result shows complex nutrition communication with precision and strategic awareness. Your next step is refinement: multi-stakeholder decisions, long-term performance planning and realistic behavior-change leadership.',
                  }
                : selectedRole === 'Performance Analyst'
                ? {
                    A2: 'Your result shows that you understand basic analysis information and key tactical terms. Your next step is to build confidence explaining patterns clearly and connecting simple evidence to coaching decisions.',
                    B1: 'Your result shows that you can communicate common analysis points. Your next step is to strengthen evidence structure, tactical explanation, and clearer recommendations for coaching staff.',
                    B2: 'Your result shows strong professional analysis communication. You can present patterns, evidence, and recommendations with clarity. Your next step is to develop influence, pressure communication, and advanced interpretation across staff contexts.',
                    C1: 'Your result shows strategic analysis communication. You can separate evidence from interpretation and integrate multiple stakeholder perspectives. Your next step is refinement: multi-stakeholder interpretation and high-level tactical influence.',
                  }
                : selectedRole === 'Fitness Coach'
                ? {
                    A2: 'Your result shows that you understand basic fitness and recovery information. Your next step is to build confidence explaining load, readiness, and simple risk decisions to players and staff.',
                    B1: 'Your result shows that you can communicate common load and recovery decisions. Your next step is to strengthen structure, data explanation, and coach-facing clarity when discussing workload and readiness.',
                    B2: 'Your result shows strong professional communication around workload, readiness, and risk. Your next step is to develop pressure communication, risk framing, and strategic influence with coaches and leadership.',
                    C1: 'Your result shows strategic performance communication. You can frame short-term performance, injury risk, and squad availability with maturity. Your next step is refinement: institutional influence, availability planning, and high-stakes load decisions.',
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
              : selectedRole === 'Sports Psychologist'
                ? {
                    A2: [
                      'Basic check-in language',
                      'Confidence support',
                      'Simple pressure-management tools',
                      'Safe player communication',
                    ],
                    B1: [
                      'Anxiety reframing',
                      'Supportive feedback',
                      'Player-centered communication',
                      'Resilience foundations',
                    ],
                    B2: [
                      'Performance identity',
                      'Mistake reframing',
                      'Injury psychology support',
                      'Coach-facing communication',
                    ],
                    C1: [
                      'Confidentiality boundaries',
                      'Multi-stakeholder alignment',
                      'High-pressure support',
                      'Strategic mental-performance care',
                    ],
                  }
                : selectedRole === 'Physiotherapist'
                ? {
                    A2: [
                      'Basic injury status language',
                      'Simple rehab instructions',
                      'Pain and movement vocabulary',
                      'Clear player explanations',
                    ],
                    B1: [
                      'Rehabilitation timeline communication',
                      'Risk explanation',
                      'Player-coach updates',
                      'Return-to-play foundations',
                    ],
                    B2: [
                      'Graduated return-to-play',
                      'Coach pressure conversations',
                      'Confidence and fear communication',
                      'Clinical progress reporting',
                    ],
                    C1: [
                      'Complex case framing',
                      'Multidisciplinary care communication',
                      'High-stakes availability decisions',
                      'Stakeholder alignment under pressure',
                    ],
                  }
                : selectedRole === 'Nutritionist'
                ? {
                    A2: [
                      'Basic fueling language',
                      'Hydration instructions',
                      'Recovery meal timing',
                      'Simple nutrition explanations',
                    ],
                    B1: [
                      'Nutrient timing',
                      'Player plan personalization',
                      'Recovery routines',
                      'Behavior-change support',
                    ],
                    B2: [
                      'Cultural nutrition adaptation',
                      'Dietary restriction support',
                      'Hydration and fatigue explanation',
                      'Adherence strategy',
                    ],
                    C1: [
                      'Multi-stakeholder nutrition decisions',
                      'Strategic performance planning',
                      'Digestive tolerance communication',
                      'Long-term behavior-change leadership',
                    ],
                  }
                : selectedRole === 'Performance Analyst'
                ? {
                    A2: [
                      'Basic tactical vocabulary',
                      'Simple pattern explanation',
                      'Video evidence foundations',
                      'Clear observation language',
                    ],
                    B1: [
                      'Tactical pattern recognition',
                      'Evidence structure',
                      'Coach-facing explanations',
                      'Video clip presentation',
                    ],
                    B2: [
                      'Data and video interpretation',
                      'Recommendation under pressure',
                      'Advanced tactical vocabulary',
                      'Player analysis communication',
                    ],
                    C1: [
                      'Multi-stakeholder interpretation',
                      'Strategic tactical influence',
                      'Evidence vs meaning',
                      'High-pressure analysis communication',
                    ],
                  }
                : selectedRole === 'Fitness Coach'
                ? {
                    A2: [
                      'Basic recovery communication',
                      'Load vocabulary foundations',
                      'Simple readiness explanations',
                      'Player support language',
                    ],
                    B1: [
                      'Coach-facing load reports',
                      'Recovery and return-to-play communication',
                      'Wellness data explanation',
                      'Clear workload recommendations',
                    ],
                    B2: [
                      'Risk and availability framing',
                      'Threshold communication',
                      'Pressure conversations with coaches',
                      'Quality over volume language',
                    ],
                    C1: [
                      'Strategic performance protection',
                      'Institutional availability planning',
                      'High-stakes load decisions',
                      'Executive-level risk communication',
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
    const pathwayLabel = levelLabels[result.level] || 'Foundation'
    const pathwayColor = levelColors[result.level] || 'text-fei-sky'
    const overallEvidence = Math.round((result.score / result.maxScore) * 100)
    const previewFocus = focusItems[1] || focusItems[0] || 'Professional football communication under pressure'

    const nextLevels: Record<string, string> = {
      A2: 'B1',
      B1: 'B2',
      B2: 'C1',
      C1: 'Elite refinement',
    }

    const levelMeanings: Record<string, string> = {
      A2: 'At A2, you can handle basic football communication in familiar situations. You may understand simple instructions, but you still need support with speed, detail, clarification, and pressure moments.',
      B1: 'At B1, you can manage common football communication tasks. Your next step is to speak with more structure, confidence, and precision when situations become tactical, detailed, or pressured.',
      B2: 'At B2, you can communicate clearly in most professional football situations. Your next step is to improve strategic control in feedback, leadership, and high-pressure conversations.',
      C1: 'At C1, you communicate with advanced professional control. Your pathway focuses on refinement, leadership influence, strategic communication, and elite-level pressure situations.',
    }

    const levelStrengths: Record<string, string[]> = {
      A2: [
        'Understands simple football instructions',
        'Recognizes familiar role vocabulary',
        'Can communicate basic needs in routine situations',
      ],
      B1: [
        'Handles common football conversations',
        'Responds to direct feedback',
        'Explains familiar situations with some structure',
      ],
      B2: [
        'Communicates clearly in professional contexts',
        'Understands more complex football information',
        'Can support decisions with relevant detail',
      ],
      C1: [
        'Uses mature professional communication',
        'Handles complex stakeholder conversations',
        'Communicates with precision under pressure',
      ],
    }

    const levelImprovements: Record<string, string[]> = {
      A2: [
        'Ask for clarification with more confidence',
        'Build stronger football-specific vocabulary',
        'Respond better when instructions are fast or pressured',
      ],
      B1: [
        'Add more structure to explanations',
        'Improve tactical and role-specific precision',
        'Communicate more confidently under pressure',
      ],
      B2: [
        'Refine leadership and feedback conversations',
        'Improve strategic communication in complex situations',
        'Control tone and detail in pressure moments',
      ],
      C1: [
        'Refine influence across stakeholders',
        'Strengthen executive and media-level communication',
        'Sharpen elite decision-making language',
      ],
    }

    const rolePathwayModules: {
      title: string
      detail: string
      scenarios?: string[]
    }[] =
      selectedRole === 'Head Coach'
        ? [
            { title: 'Match Briefing Language', detail: 'Structure pre-match and half-time messages with clarity, tactical focus, and emotional control.' },
            { title: 'Tactical Correction & Feedback', detail: 'Correct players without losing authority, confidence, or tactical precision.' },
            { title: 'Pressure Communication with Players', detail: 'Handle difficult decisions, frustration, substitutions, and performance conversations.' },
            { title: 'Media and Leadership Communication', detail: 'Represent decisions clearly to media, staff, leadership, and the squad.' },
          ]
        : selectedRole === 'Assistant Coach'
          ? [
              { title: 'Training Exercise Communication', detail: 'Explain drills, objectives, timing, and corrections clearly during training.' },
              { title: 'Tactical Clarification', detail: 'Translate tactical ideas into simple player-facing language.' },
              { title: 'Player Correction Under Pressure', detail: 'Give useful corrections during repetition, fatigue, and live-play moments.' },
              { title: 'Staff Alignment Communication', detail: 'Support the head coach message and maintain consistency across the staff.' },
            ]
          : selectedRole === 'Academy Director'
            ? [
                { title: 'Academy Standards Communication', detail: 'Communicate development expectations clearly to coaches, players, and families.' },
                { title: 'Player Pathway Conversations', detail: 'Explain progression, readiness, setbacks, and long-term development decisions.' },
                { title: 'Parent and Staff Alignment', detail: 'Manage expectations and keep stakeholders aligned around development priorities.' },
                { title: 'First-Team Readiness Decisions', detail: 'Frame readiness decisions with evidence, maturity, and institutional clarity.' },
              ]
            : selectedRole === 'Head of Scouting'
              ? [
                  { title: 'Recruitment Profile Language', detail: 'Define player profiles, priorities, and fit with more precision.' },
                  { title: 'Scout Report Alignment', detail: 'Create consistent language across reports, observations, and recommendations.' },
                  { title: 'Market and Value Communication', detail: 'Explain timing, budget, value, availability, and risk to decision-makers.' },
                  { title: 'Board-Level Recommendation Defense', detail: 'Defend recruitment logic with strategic clarity and evidence.' },
                ]
              : selectedRole === 'Scout'
                ? [
                    { title: 'Player Observation Language', detail: 'Describe strengths, weaknesses, role fit, and behavior with clear football language.' },
                    { title: 'Evidence-Based Scout Reports', detail: 'Connect observations to evidence, context, and recruitment relevance.' },
                    { title: 'Profile Fit and Risk Framing', detail: 'Compare players, explain uncertainty, and communicate value responsibly.' },
                    { title: 'Recommendation Defense', detail: 'Present and defend recommendations to recruitment leaders with confidence.' },
                  ]
                : selectedRole === 'Fitness Coach'
                  ? [
                      { title: 'Load and Readiness Communication', detail: 'Explain workload, fatigue, availability, and readiness in practical football language.' },
                      { title: 'Recovery and Risk Updates', detail: 'Communicate recovery status and risk without sounding negative or unclear.' },
                      { title: 'Coach-Facing Performance Reports', detail: 'Turn data into clear recommendations for coaching staff.' },
                      { title: 'Pressure Conversations Around Availability', detail: 'Manage difficult conversations when performance and injury risk compete.' },
                    ]
                  : selectedRole === 'Performance Analyst'
                    ? [
                        {
                          title: 'Tactical Pattern Communication',
                          detail: 'Explain patterns, threats, and opportunities with concise tactical language.',
                          scenarios: [
                            'Identify an opponent build-up pattern',
                            'Explain a recurring defensive weakness',
                            'Highlight a transition opportunity',
                          ],
                        },
                        {
                          title: 'Video and Data Explanation',
                          detail: 'Connect clips and data to coaching decisions without overloading the message.',
                          scenarios: [
                            'Introduce a video sequence to coaching staff',
                            'Connect performance data to match evidence',
                            'Prioritize the most relevant analytical insight',
                          ],
                        },
                        {
                          title: 'Coach-Facing Recommendations',
                          detail: 'Present clear recommendations for staff meetings and match preparation.',
                          scenarios: [
                            'Recommend a tactical adjustment',
                            'Defend an analysis during a staff meeting',
                            'Summarize opposition priorities before the match',
                          ],
                        },
                        {
                          title: 'Player Analysis Under Pressure',
                          detail: 'Communicate individual analysis with clarity, confidence, and useful detail.',
                          scenarios: [
                            'Deliver concise individual video feedback',
                            'Explain a mistake without undermining confidence',
                            'Respond to player disagreement or clarification',
                          ],
                        },
                      ]
                    : selectedRole === 'Nutritionist'
                      ? [
                          { title: 'Fueling and Hydration Communication', detail: 'Explain fueling, hydration, recovery, and timing in practical player language.' },
                          { title: 'Match-Day Nutrition Planning', detail: 'Guide players through pre-match, half-time, and post-match nutrition routines.' },
                          { title: 'Player Behavior Change', detail: 'Support adherence with realistic, culturally aware communication.' },
                          { title: 'Performance Nutrition Under Pressure', detail: 'Manage nutrition conversations around fatigue, recovery, and performance demands.' },
                        ]
                      : selectedRole === 'Physiotherapist'
                        ? [
                            { title: 'Injury Status Communication', detail: 'Explain pain, status, treatment, and short-term expectations clearly.' },
                            { title: 'Rehabilitation Progress Updates', detail: 'Communicate rehab progress to players, coaches, and staff with precision.' },
                            { title: 'Return-to-Play Conversations', detail: 'Frame readiness, risk, confidence, and next steps responsibly.' },
                            { title: 'Coach and Player Risk Alignment', detail: 'Manage pressure around availability while protecting player welfare.' },
                          ]
                        : selectedRole === 'Sports Psychologist'
                          ? [
                              { title: 'Confidence and Pressure Language', detail: 'Support players through anxiety, mistakes, pressure, and confidence dips.' },
                              { title: 'Player Check-In Communication', detail: 'Use clear, safe, player-centered language in mental performance conversations.' },
                              { title: 'Mistake Reframing and Resilience', detail: 'Help players reset after errors and build stronger performance routines.' },
                              { title: 'Coach-Facing Mental Performance Support', detail: 'Communicate support needs to staff while protecting trust and confidentiality.' },
                            ]
                          : [
                              { title: 'Matchday Communication Foundations', detail: 'Build confidence with basic instructions, clarification, and everyday matchday situations.' },
                              { title: 'Clarification and Feedback', detail: 'Learn how to ask questions, confirm instructions, and respond to feedback professionally.' },
                              { title: 'Medical and Physical Status Communication', detail: 'Explain discomfort, fatigue, recovery, and availability clearly to staff.' },
                              { title: 'Pressure Interviews and Team Communication', detail: 'Prepare for short interviews, teammate communication, and pressure moments.' },
                            ]

    const nextLevel = nextLevels[result.level] || 'Next level'
    const levelMeaning = levelMeanings[result.level] || levelMeanings.A2
    const strengths = levelStrengths[result.level] || levelStrengths.A2
    const improvements = levelImprovements[result.level] || levelImprovements.A2

    const communicationBase =
      selectedRole === 'Performance Analyst'
        ? [
            'You can follow the main message in familiar football and analysis conversations.',
            'You recognize essential language used around video, data and tactical preparation.',
            'You can share straightforward observations when the context is clear.',
          ]
        : strengths

    const pathwayOutcomes =
      selectedRole === 'Performance Analyst'
        ? [
            'Turn tactical patterns into clear messages coaches can act on.',
            'Present video and data insights without overloading the conversation.',
            'Defend recommendations with confidence in staff meetings and match preparation.',
          ]
        : improvements

    const foundations = [
      'Building Professional Relationships',
      'Giving & Receiving Feedback',
      'Managing Difficult Conversations',
      'Communicating Under Pressure',
      'Influencing & Leading Communication',
      'Explaining Decisions',
      'Negotiating Professionally',
    ]

    const professionalPlayerDomains = [
      {
        domain: 'Domain 1',
        title: 'On-Pitch Communication',
        detail: 'Fast, directional and unambiguous communication during live football situations.',
        scenarios: ['S1 Match Communication', 'S2 Tactical Communication & Clarification'],
      },
      {
        domain: 'Domain 2',
        title: 'Feedback, Staff & Availability',
        detail: 'Feedback conversations, tactical clarification, injury reporting and staff communication.',
        scenarios: ['S3 Receiving Feedback', 'S4 Feedback Delivery', 'S5 Communicating Injury or Discomfort'],
      },
      {
        domain: 'Domain 3',
        title: 'Dressing Room Leadership',
        detail: 'Leadership, peer support and private conflict resolution inside the squad environment.',
        scenarios: ['S6 Leadership Communication', 'S7 Peer Support Communication', 'S8 Conflict Resolution'],
      },
      {
        domain: 'Domain 4',
        title: 'Media & Public Communication',
        detail: 'Media interviews, public statements and crisis communication where every word is visible.',
        scenarios: ['S9 Media Interview Communication', 'S10 Apology or Crisis Statement', 'S11 Social Media Communication'],
      },
      {
        domain: 'Domain 5',
        title: 'Personal Brand',
        detail: 'Personal narrative, sponsor communication and authentic public identity across platforms.',
        scenarios: ['S12 Personal Branding Communication', 'S13 Sponsor Communication'],
      },
      {
        domain: 'Domain 6',
        title: 'Career Management',
        detail: 'Role expectations, playing time, development conversations and professional negotiation.',
        scenarios: ['S14 Contract & Role Expectation Conversation'],
      },
    ]

    const professionalPlayerScenarioDescriptions: Record<string, string> = {
      'S1 Match Communication':
        'Give and respond to clear, immediate instructions during live match situations.',
      'S2 Tactical Communication & Clarification':
        'Understand tactical detail and ask precise questions when instructions are unclear.',
      'S3 Receiving Feedback':
        'Process coaching feedback professionally and confirm the action required.',
      'S4 Feedback Delivery':
        'Give constructive feedback to teammates with clarity, respect and purpose.',
      'S5 Communicating Injury or Discomfort':
        'Describe pain, discomfort and physical limitations accurately to medical staff.',
      'S6 Leadership Communication':
        'Guide teammates with calm, credible communication during demanding moments.',
      'S7 Peer Support Communication':
        'Support teammates through setbacks, pressure and difficult performance moments.',
      'S8 Conflict Resolution':
        'Address disagreement privately and protect trust within the squad.',
      'S9 Media Interview Communication':
        'Respond to media questions clearly while protecting the team and club.',
      'S10 Apology or Crisis Statement':
        'Take responsibility and communicate appropriately after a sensitive incident.',
      'S11 Social Media Communication':
        'Communicate publicly with awareness of audience, tone and professional risk.',
      'S12 Personal Branding Communication':
        'Express a clear and authentic professional identity across public platforms.',
      'S13 Sponsor Communication':
        'Represent personal and partner values naturally in commercial communication.',
      'S14 Contract & Role Expectation Conversation':
        'Discuss playing time, development and career expectations with professional control.',
    }

    const isProfessionalPlayerPathway = selectedRole === 'Professional Player'

    const levelHooks: Record<string, string> = {
      A2: 'You already communicate in familiar football situations. Your next step is responding with greater confidence when messages become faster, more tactical or more pressured.',
      B1: 'You manage routine football communication. Your next step is adding more structure, precision and confidence in demanding situations.',
      B2: 'You communicate effectively in most professional situations. Your next step is gaining greater strategic control in leadership, feedback and pressure moments.',
      C1: 'You communicate with advanced professional control. Your next step is refining influence, leadership presence and elite communication under pressure.',
    }

    const nextLevelLabels: Record<string, string> = {
      A2: 'Intermediate',
      B1: 'Professional',
      B2: 'Advanced Professional',
      C1: 'Elite refinement',
    }

    const pathwayScenarioCount = isProfessionalPlayerPathway
      ? professionalPlayerDomains.reduce(
          (total, domain) => total + domain.scenarios.length,
          0
        )
      : rolePathwayModules.reduce(
          (total, module) => total + (module.scenarios?.length || 0),
          0
        )

    return (
      <div className="min-h-screen bg-[#F7F8FA] text-fei-bg">
        <nav className="sticky top-0 z-50 w-full border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[60px] w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
            <Link
              href="/"
              className="flex items-center"
              aria-label="Go to FEI home"
            >
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-9 w-auto"
              />

              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className="relative hidden px-3 py-2 text-sm font-semibold text-fei-bg after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:bg-fei-yellow sm:inline-flex"
              >
                Dashboard
              </Link>

              <Link
                href="/learning"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg sm:inline-flex"
              >
                Learning Path
              </Link>

              <Link
                href="/settings"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg sm:inline-flex"
              >
                Settings
              </Link>

              <span className="mx-2 hidden h-5 w-px bg-fei-bg/10 sm:block" />

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/50 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        <main className="px-6 pb-6 pt-7 sm:px-8 lg:pb-7 lg:pt-9">
          <div className="mx-auto w-full max-w-[1280px]">
            <section className="pb-10">
              <h1 className="max-w-5xl text-4xl leading-[1.02] tracking-[-0.045em] text-fei-bg sm:text-5xl lg:text-[3.35rem]">
                <span className="font-normal">
                  Your
                </span>{' '}
                <span className="font-black">
                  FEI diagnostic result
                </span>{' '}
                <span className="font-normal">
                  is ready.
                </span>
              </h1>

            </section>

            <section className="overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-white shadow-[0_18px_55px_rgba(7,17,31,0.05)]">
              <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
                <div className="p-6 sm:p-6 lg:border-r lg:border-fei-bg/10 lg:px-8 lg:py-6">
                  <p className="text-xs font-black uppercase tracking-[0.23em] text-fei-bg/55">
                    Your Current Level
                  </p>

                  <div className="mt-4 flex items-end gap-4">
                    <p className="text-6xl font-black leading-none tracking-[-0.07em] text-fei-sky sm:text-7xl">
                      {result.level}
                    </p>

                    <div className="pb-2">
                      <p className="text-3xl font-black tracking-[-0.035em] text-fei-bg sm:text-4xl">
                        {pathwayLabel}
                      </p>

                      <p className="mt-2 text-sm font-medium text-fei-bg/42">
                        CEFR professional communication level
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-bold text-fei-bg/65">
                    {selectedRole}
                  </p>
                </div>

                <div className="border-t border-fei-bg/10 p-6 sm:p-6 lg:border-t-0 lg:px-8 lg:py-6">
                  <p className="text-xs font-black uppercase tracking-[0.23em] text-fei-bg/40">
                    What This Means
                  </p>

                  <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-fei-bg/68">
                    {levelHooks[result.level] || levelHooks.A2}
                  </p>

                  <div className="mt-6 border-t border-fei-bg/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/40">
                        Diagnostic Evidence
                      </p>

                      <p className="min-w-[76px] text-right text-3xl font-black tabular-nums tracking-[-0.04em] text-fei-bg">
                        {animatedEvidence}%
                      </p>
                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-fei-bg/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fei-sky to-fei-yellow transition-[width] duration-75 ease-linear"
                        style={{ width: `${animatedEvidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-7 border-y border-fei-bg/10 py-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.23em] text-fei-bg/55">
                  Your Communication Opportunity
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-fei-bg sm:text-[1.7rem]">
                  Your communication potential—and how FEI develops it.
                </h2>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
                <div className="lg:pr-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-fei-bg/52">
                    Your Current Base
                  </p>

                  <div className="mt-3 border-t border-fei-bg/10">
                    {communicationBase.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 border-b border-fei-bg/[0.08] py-3"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-fei-sky" />

                        <p className="text-sm leading-6 text-fei-bg/66">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-fei-bg/10 pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-fei-bg/52">
                    What FEI Will Help You Deliver
                  </p>

                  <div className="mt-3 border-t border-fei-bg/10">
                    {pathwayOutcomes.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 border-b border-fei-bg/[0.08] py-3"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-fei-yellow" />

                        <p className="text-sm font-normal leading-6 text-fei-bg/66">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-white shadow-[0_18px_55px_rgba(7,17,31,0.045)]">
                <div className="grid lg:grid-cols-[1fr_340px]">
                  <div className="p-7 sm:p-9 lg:border-r lg:border-fei-bg/10">
                    <p className="text-xs font-black uppercase tracking-[0.23em] text-fei-bg/42">
                      Your Personalized Training Pathway
                    </p>

                    <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-fei-bg sm:text-4xl">
                      {selectedRole}
                    </h2>

                    <p className="mt-3 text-sm font-semibold text-fei-bg/48">
                      {isProfessionalPlayerPathway
                        ? `${professionalPlayerDomains.length} domains · ${pathwayScenarioCount} real football scenarios`
                        : pathwayScenarioCount > 0
                          ? `${rolePathwayModules.length} role-specific modules · ${pathwayScenarioCount} professional scenarios`
                          : `${rolePathwayModules.length} role-specific modules`}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-fei-bg/10 pt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-fei-bg/36">
                          Current
                        </span>

                        <span className="text-2xl font-black text-fei-sky">
                          {result.level}
                        </span>

                        <span className="text-base font-bold text-fei-bg/65">
                          {pathwayLabel}
                        </span>
                      </div>

                      <span className="text-xl font-black text-fei-bg/20">
                        →
                      </span>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-fei-sky">
                          Next
                        </span>

                        <span className="text-2xl font-black text-fei-bg">
                          {nextLevel}
                        </span>

                        <span className="text-base font-bold text-fei-bg/65">
                          {nextLevelLabels[result.level] || 'Next milestone'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-between overflow-hidden border-t border-fei-bg/10 bg-fei-sky/[0.055] p-7 sm:p-9 lg:border-t-0">
                    <div className="absolute inset-x-0 top-0 h-1 bg-fei-yellow" />
                    <div>
                      <p className="text-center text-xs font-black uppercase tracking-[0.22em] text-fei-bg/52">
                        Complete pathway
                      </p>

                      <div className="mt-5 flex items-end justify-center gap-2 text-center">
                        <p className="text-6xl font-black leading-none tracking-[-0.06em] text-fei-bg">
                          $49
                        </p>

                        <p className="pb-1.5 text-base font-bold text-fei-bg/48">
                          / month
                        </p>
                      </div>
                    </div>

                    <div className="mt-7">
                      <button
                        type="button"
                        onClick={() => router.push('/#pricing')}
                        className="w-full rounded-full bg-fei-yellow px-7 py-4 text-base font-black text-fei-bg shadow-[0_12px_30px_rgba(255,204,0,0.22)] transition hover:-translate-y-0.5 hover:bg-fei-yellow/90"
                      >
                        Unlock My Pathway
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 w-full text-center text-sm font-bold text-fei-bg/44 transition hover:text-fei-bg"
                      >
                        Review My Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isProfessionalPlayerPathway ? (
                <div className="mt-3 lg:ml-10">
                  {professionalPlayerDomains.map((domain, index) => (
                    <article
                      key={domain.domain}
                      className="grid gap-5 border-b border-fei-bg/10 py-7 lg:grid-cols-[72px_0.8fr_1.2fr] lg:items-center"
                    >
                      <p className="text-3xl font-black text-fei-sky">
                        {String(index + 1).padStart(2, '0')}
                      </p>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/38">
                          {domain.domain}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-fei-bg">
                          {domain.title}
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-fei-bg/48">
                          {domain.detail}
                        </p>
                      </div>

                      <div>
                        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-fei-sky">
                          Your Practice Journey
                        </p>

                        <div className="flex flex-col">
                          {domain.scenarios.map((scenario, scenarioIndex) => (
                            <div
                              key={scenario}
                              className="grid grid-cols-[34px_1fr] items-center gap-3 border-b border-fei-bg/[0.07] py-3 first:pt-0 last:border-b-0 last:pb-0"
                            >
                              <span className="text-xs font-black text-fei-sky">
                                {String(scenarioIndex + 1).padStart(2, '0')}
                              </span>

                              <div>
                                <p className="text-sm font-bold leading-5 text-fei-bg/72">
                                  {scenario.replace(/^S\d+\s*/, '')}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-fei-bg/40">
                                  {professionalPlayerScenarioDescriptions[scenario]}
                                </p>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 lg:ml-12">
                  {rolePathwayModules.map((module, index) => (
                    <article
                      key={module.title}
                      className="grid gap-5 border-b border-fei-bg/10 py-8 lg:grid-cols-[72px_0.82fr_1.18fr] lg:items-start"
                    >
                      <p className="text-3xl font-black text-fei-sky">
                        {String(index + 1).padStart(2, '0')}
                      </p>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/38">
                          Module {String(index + 1).padStart(2, '0')}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-fei-bg">
                          {module.title}
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-7 text-fei-bg/52">
                          {module.detail}
                        </p>
                      </div>

                      {module.scenarios && module.scenarios.length > 0 && (
                        <div className="lg:pl-14">
                          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-fei-sky">
                            Professional Scenarios
                          </p>

                          <div className="flex flex-col">
                            {module.scenarios.map((scenario, scenarioIndex) => (
                              <div
                                key={scenario}
                                className="grid grid-cols-[34px_1fr] items-center gap-3 border-b border-fei-bg/[0.07] py-3 first:pt-0 last:border-b-0 last:pb-0"
                              >
                                <span className="text-xs font-black text-fei-sky">
                                  {String(scenarioIndex + 1).padStart(2, '0')}
                                </span>

                                <div>
                                  <p className="text-sm font-bold leading-5 text-fei-bg/72">
                                    {scenario}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-fei-bg/40">
                                    Applied communication practice in a real performance environment
                                  </p>
                                </div>

                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <p className="mt-5 text-center text-xs text-fei-bg/35">
              Your diagnostic profile has been saved to your FEI dashboard.
            </p>
          </div>
        </main>
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
