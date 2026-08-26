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
      question: 'Choose the best option.',
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
      question: 'Choose the best option.',
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
      context: 'The assistant coach sends this message before training:\n\n"Today we work in a mid-block. Stay close to the 6 and protect the inside channel. When the ball goes wide to their fullback, jump with the nearest winger. If they continue playing through midfield, stay connected and do not leave the central space."',
      question: 'The opposition continues building through midfield. What is your main responsibility?',
      options: [
        'A. Step out alone and press the player on the ball',
        'B. Stay connected to the 6 and protect the central space',
        'C. Move toward the touchline to support the winger',
        'D. Drop immediately alongside the center-backs',
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
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Role Expectations Under Review',
      context: 'Before a meeting, your agent forwards you this message from the Sporting Director:\n\n"Having reviewed the last six weeks, the coaching staff still see you as an important part of the squad. That said, with younger players pushing for minutes and the team likely to rotate more heavily, your role may not look exactly as it did at the start of the season.\n\nHad your availability been more consistent, the situation might have developed differently. For now, the club is not looking to move you on, but neither can regular starts be guaranteed. The next month will be important in determining how the role evolves."',
      question: 'What is the Sporting Director implying about the player\'s situation?',
      options: [
        'A. The club has already decided to sell the player because younger players are now preferred',
        'B. The player remains valued, but his status is less secure and future playing time will depend on upcoming circumstances',
        'C. The coaching staff believe the player\'s injuries are the only reason he has lost his place in the team',
        'D. The club wants the player to accept a reduced role for the rest of the season regardless of future performances',
      ],
      correct: 'B',
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
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Patience and Passivity',
      script: 'I don\'t want us chasing the game emotionally if the first twenty minutes don\'t go our way. They\'ll try to drag us into transitions, especially if we start forcing passes. If we\'re patient, their press will eventually open spaces for us. What I don\'t want is for patience to become passivity. We still need to recognize the moments when the game is asking us to accelerate.',
      question: 'What distinction is the Head Coach making between patience and passivity?',
      options: [
        'A. Patience means keeping possession, while passivity means defending deeper',
        'B. Patience means staying controlled until an opportunity appears; passivity means failing to act when that opportunity comes',
        'C. Patience means avoiding transitions completely, while passivity means allowing the opponent to attack',
        'D. Patience means slowing the game down, while passivity means letting teammates make the decisions',
      ],
      correct: 'B',
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
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Tactical Precision',
      context: 'The analyst says: "Their midfield tends to overcommit when they press, which leaves the space behind the first line exposed."',
      question: 'What does "overcommit" mean here?',
      options: [
        'A. Move too many players forward into the press and leave space behind',
        'B. Press with greater physical intensity than the situation requires',
        'C. Keep pressing for too long after the opposition has escaped',
        'D. Push the defensive line higher to support the midfield',
      ],
      correct: 'A',
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
      context:
        'Which responsibility is most typical for a first-team head coach?',
      question: 'Choose the best option.',
      options: [
        'A. Giving individual rehabilitation updates to injured players',
        'B. Presenting detailed player reports to the recruitment department',
        'C. Setting tactical direction and aligning players and staff',
        'D. Managing academy education plans with families',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context:
        'Which communication skill has the greatest impact on your effectiveness as a head coach?',
      question: 'Choose the best option.',
      options: [
        'A. Explaining decisions clearly and aligning players and staff',
        'B. Producing regular public content for club media channels',
        'C. Leading detailed contract negotiations with agents',
        'D. Writing medical return-to-play reports for the squad',
      ],
      correct: 'A',
    },
  ],

  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Defensive Focus',
      context:
        'Your assistant coach sends this note before training:\n\n“Today we’re working on our mid-block. Keep the midfield line close to the back four. Do not leave space between the lines. When the ball goes wide, shift together and stay compact.”',
      question: 'What is the main defensive focus?',
      options: [
        'A. Press every pass as soon as the opponent receives the ball',
        'B. Defend close to the penalty area with a very deep block',
        'C. Move the midfield line wider to cover both touchlines',
        'D. Stay compact and protect the space between the lines',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Opposition Weakness',
      context:
        'The analyst sends this opposition note:\n\n“Their fullbacks push high in possession, but the midfield is slow to cover the wide areas. When they lose the ball, space often opens behind the fullbacks. Quick switches and early forward passes can create chances before they recover.”',
      question: 'Which weakness should the coach target?',
      options: [
        'A. The goalkeeper’s positioning against long-range shots',
        'B. The space behind the fullbacks during defensive transition',
        'C. The center-backs’ ability to defend direct aerial balls',
        'D. The strikers’ movement when the team builds from the back',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Crisis Management Brief',
      context:
        'Internal staff memo:\n\n“The last three results have increased pressure, but the tactical framework is not the main issue. The data shows that the team is reaching productive areas, although execution in both boxes has declined. The message to the squad must protect confidence while making performance standards non-negotiable.”',
      question: 'Which internal message best reflects the evidence?',
      options: [
        'A. Keep the tactical framework, improve execution and reinforce standards',
        'B. Protect confidence by avoiding direct criticism of recent performances',
        'C. Change the tactical model immediately to demonstrate decisive action',
        'D. Focus on motivation now and postpone the performance analysis',
      ],
      correct: 'A',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Strategic Alignment Under Pressure',
      context:
        'The Sporting Director sends this message after a difficult run of results:\n\n“The board still supports your work, but the pressure is increasing. Football decisions remain yours, although over the next few weeks I want us to stay more closely aligned on selection and staff decisions. If performances do not improve, we may need to review how some decisions are being made.”',
      question: 'What is the Sporting Director implying?',
      options: [
        'A. The board has decided to take control of team selection',
        'B. The Head Coach is still supported, but his autonomy may become more limited if results do not improve',
        'C. The Sporting Director wants the Head Coach to replace members of his staff immediately',
        'D. The club believes recent results are mainly caused by poor communication',
      ],
      correct: 'B',
    },
  ],

  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Midfield Protection',
      script:
        'Today we play with three midfielders. The number six protects the space in front of the back line. Stay connected and do not leave the middle open. Compact, always compact.',
      question: 'What is the main priority for the midfield?',
      options: [
        'A. Push higher to support the striker in every attack',
        'B. Spread out quickly to cover both touchlines',
        'C. Protect the central space in front of the defense',
        'D. Drop all three midfielders into the penalty area',
      ],
      correct: 'C',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Player Availability Decision',
      script:
        'The player is showing higher fatigue levels than normal after this week’s training. He is available to start, but I would not recommend a full match. We should manage his minutes carefully in the second half and monitor how he responds. If the match allows, I suggest taking him off before the 70th minute so we can reduce the risk and keep him available for the next game.',
      question: 'What does the fitness coach recommend?',
      options: [
        'A. Leave the player out because he is not available to start',
        'B. Start the player, manage his minutes and take him off early if possible',
        'C. Play the player for the full match and reduce his next training session',
        'D. Use the player only if the team needs him late in the second half',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Post-Match Leadership',
      script:
        'The result is difficult to accept, but we cannot let the score distort our analysis. For long periods, our pressing was coordinated, our distances were better, and we controlled the match more effectively than in recent weeks. The second goal came from a poor decision in build-up, and we must take responsibility for that moment. Tomorrow, we will correct the detail without allowing one mistake to erase the progress or lower the standards we expect from this group.',
      question: 'What is the coach’s main message to the team?',
      options: [
        'A. The tactical structure failed and needs to be changed immediately',
        'B. The team should focus only on the positive parts of the performance',
        'C. One individual mistake was the main reason for the defeat',
        'D. The team must correct the error while keeping perspective, progress and standards',
      ],
      correct: 'D',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Public Message vs Internal Concern',
      script:
        'Publicly, we need to stay calm and show confidence in the direction of the team. Internally, though, we cannot ignore the pattern. The performances are not collapsing, but the same problems are appearing too often. I’m not asking for a complete change, but I do expect us to review whether the current approach is still giving us enough control.',
      question: 'What is the speaker’s main concern?',
      options: [
        'A. The club should publicly admit that the tactical plan has failed',
        'B. The team needs a complete tactical change before the next match',
        'C. The public message should remain stable, while the current approach is reviewed more critically behind the scenes',
        'D. The performances are improving, but external criticism is creating unnecessary pressure',
      ],
      correct: 'C',
    },
  ],

  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Compactness',
      context:
        'During training, the coach says: “The back line and midfield need compactness when we defend.”',
      question: 'What does “compactness” mean here?',
      options: [
        'A. Players stay close enough to protect central spaces',
        'B. Players use short passes to keep possession safely',
        'C. Players move quickly into wide attacking positions',
        'D. Players keep the ball far away from the goalkeeper',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Pressing Trigger',
      context:
        'The assistant coach says: “Our pressing trigger is the pass from their goalkeeper to the center-back.”',
      question: 'What is a “pressing trigger”?',
      options: [
        'A. The player responsible for leading every pressing action',
        'B. The defensive shape used after losing possession',
        'C. The moment or cue that starts the press',
        'D. The mistake that ends a pressing sequence',
      ],
      correct: 'C',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Squad Planning',
      context:
        'The Sporting Director says: “We need to review squad availability across the next three transfer windows before confirming recruitment priorities.”',
      question: 'What does “squad availability” refer to in this context?',
      options: [
        'A. Media commitments during the next three match weeks',
        'B. Access to training facilities during preparation periods',
        'C. Travel availability for upcoming away fixtures',
        'D. Which players are expected to remain, leave or become available',
      ],
      correct: 'D',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Strategic Language',
      context:
        'The Sporting Director says: “We cannot let short-term pressure compromise the principles that underpin the project.”',
      question: 'What does “underpin” mean here?',
      options: [
        'A. Publicly represent the project during difficult periods',
        'B. Provide the fundamental support or basis for the project',
        'C. Change the project gradually in response to pressure',
        'D. Protect the project from criticism outside the club',
      ],
      correct: 'B',
    },
  ],

  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Clear Instruction',
      context:
        'A player does not understand the pressing trigger. You have 20 seconds to explain it clearly.',
      question: 'Which explanation is clearest?',
      options: [
        'A. Press with intensity, but do not lose the team shape.',
        'B. Wait for the pass to the fullback; then close him down.',
        'C. The trigger depends on how confident the opponent looks.',
        'D. Press whenever you feel the opponent is under pressure.',
      ],
      correct: 'B',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Feedback Under Resistance',
      context:
        'During video feedback, a player says: “But the center-back moved late, not me.” You need to keep the conversation productive.',
      question: 'What is the best response?',
      options: [
        'A. You are focusing on the wrong player; watch your position again.',
        'B. The center-back was late, so we will review his clip separately.',
        'C. His timing was late, but your starting position gave you no recovery time.',
        'D. This is not about blame; you only need to concentrate more.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Crisis Media Response',
      context:
        'After two losses, a journalist says: “Your defense looks broken. Do you need to change the system completely?”',
      question: 'Which response is most professional?',
      options: [
        'A. Our defensive structure needs better transition positioning, not a complete reset.',
        'B. The defense is not broken; the results make the question sound worse.',
        'C. We will change what is necessary, but I will not discuss the plan today.',
        'D. The players know the problem, and they must respond better tomorrow.',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Executive Negotiation',
      context:
        'The Sporting Director says: “We need to reduce costs. Can you work with fewer staff members and still compete?”',
      question: 'What is the most strategic response?',
      options: [
        'A. We can reduce some staff, but the performance risk will increase.',
        'B. Yes, if everyone accepts more responsibility across departments.',
        'C. I can work with fewer staff, but recruitment and analysis must remain untouched.',
        'D. Let us define the acceptable level of risk first; then I can propose responsible reductions.',
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
      context: 'Which situation is most likely to be part of your daily work as a first-team assistant coach?',
      question: 'Choose the best option.',
      options: [
        'A. Explaining the head coach’s tactical priorities to a small group of players',
        'B. Approving the club’s final transfer budget with the board',
        'C. Diagnosing a player’s injury before the medical assessment',
        'D. Negotiating commercial agreements with club sponsors',
      ],
      correct: 'A',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'During a training session, players are completing an exercise correctly, but their timing and coordination are inconsistent.',
      question: 'What is the most appropriate communication priority for the assistant coach?',
      options: [
        'A. Stop the exercise and redesign the full tactical system',
        'B. Give a brief correction, clarify the timing and restart the exercise',
        'C. Wait until the post-match meeting to discuss the problem',
        'D. Ask the sporting director to speak directly to the players',
      ],
      correct: 'B',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Session Instruction',
      context: 'Before training, the head coach sends this note:\n\n"In the first exercise, work with the wide players. When the ball goes to the fullback, the winger should move inside and the fullback should overlap. Keep the explanation short and show the movement once."',
      question: 'What should the assistant coach do?',
      options: [
        'A. Explain the movement briefly and demonstrate it once.',
        'B. Ask the players to solve the movement without guidance.',
        'C. Focus only on the defensive line during the exercise.',
        'D. Stop the session and redesign the full practice.',
      ],
      correct: 'A',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Unit Coordination',
      context: 'After the first training block, the analyst writes:\n\n"The back line moved forward at the right moment, but the midfield line reacted late. This created too much space between the units. The assistant coach should correct the timing before the next repetition."',
      question: 'What is the main issue?',
      options: [
        'A. The back line moved too slowly.',
        'B. The midfield did not move with the back line.',
        'C. The team defended too close to its own goal.',
        'D. The players pressed too aggressively near the ball.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Translating Analysis into Coaching',
      context: 'Before the final training block, the performance analyst reports:\n\n"The opponent’s midfielders receive comfortably when our first line presses straight ahead. They become less effective when the pressing player curves the run and blocks the inside pass. The players understand the intensity required, but not the angle of the press."',
      question: 'What should the assistant coach prioritize in the next correction?',
      options: [
        'A. Increase the speed of every pressing action.',
        'B. Explain how the pressing angle removes the inside passing option.',
        'C. Ask the midfield line to defend deeper after every forward pass.',
        'D. Reduce the number of players involved in the pressing exercise.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Set-Piece Adjustment Under Pressure',
      context:
        'The opposition has changed its defensive setup on corners. They are now leaving one player higher and using a hybrid marking system, with three zonal defenders across the six-yard box and four players marking individually. Your original routine was designed to overload the back-post zone, but the new setup is reducing the space there.',
      question: 'What is the most appropriate interpretation for the Assistant Coach responsible for set pieces?',
      options: [
        'A. Keep the original routine because changing it during the match could confuse the players',
        'B. Abandon attacking corners and prioritize defensive security against the counterattack',
        'C. Adjust the routine to exploit the new defensive structure while preserving the team’s protection against transition',
        'D. Ask the Head Coach to redesign the entire attacking set-piece plan before the next corner',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Drill Transition',
      script: 'Start with the possession game. When the defenders win the ball, they have five seconds to attack either mini-goal. Keep the transition quick and let the exercise continue.',
      question: 'What happens after the defenders win the ball?',
      options: [
        'A. They quickly attack either mini-goal.',
        'B. They restart possession from the goalkeeper.',
        'C. They wait while the coach reorganizes the teams.',
        'D. They keep the ball until the exercise stops.',
      ],
      correct: 'A',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Unit Timing',
      script: 'The back line is stepping forward at the right moment, but the midfield is reacting too late. That gap is giving the opposition time to receive and turn. Before the next block, reinforce that both units must move together.',
      question: 'What should the assistant coach correct?',
      options: [
        'A. The intensity of the first pressing action.',
        'B. The timing between the back line and midfield.',
        'C. The positioning of the wide attacking players.',
        'D. The speed of the opposition’s forward passes.',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Pressing Angle',
      script: 'The intensity is good, but the first player is pressing in a straight line. That leaves the inside pass open and forces the midfield to react late. In the next repetition, correct the angle of the run. We want the player to press while showing the opponent toward the touchline.',
      question: 'What is the main tactical correction?',
      options: [
        'A. Delay the press until the midfield has dropped deeper.',
        'B. Increase the speed of the run without changing its direction.',
        'C. Curve the pressing run to block the inside pass.',
        'D. Allow the opponent to play centrally before applying pressure.',
      ],
      correct: 'C',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Set-Piece Responsibility Under Change',
      script:
        'On the next corner, keep the same initial setup, but change the second movement. Their front zonal player is stepping aggressively toward the first run, which is opening space behind him. I want the blocker to hold his position half a second longer, then release the runner into that space. Do not change the rest of the structure because we still need protection if they clear the first ball.',
      question: 'What is the Assistant Coach being asked to adjust?',
      options: [
        'A. Replace the entire corner routine because the opponent has changed its marking',
        'B. Change the timing of one movement while keeping the overall structure and transition protection',
        'C. Move more players into the penalty area to create a numerical advantage',
        'D. Remove the blocker because the opponent is defending the first run aggressively',
      ],
      correct: 'B',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Walk-through',
      context: 'The coach says: “Before we increase the intensity, do one walk-through so everyone understands the movement.”',
      question: 'What does “walk-through” mean here?',
      options: [
        'A. A slow rehearsal of the movement without full intensity.',
        'B. A recovery walk completed after the training session.',
        'C. A video review of the exercise with the coaching staff.',
        'D. A fitness test performed before the players begin training.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Freeze the Practice',
      context: 'A player asks: “When you say ‘freeze the practice’, do you want us to stop exactly where we are?”',
      question: 'What does “freeze the practice” mean?',
      options: [
        'A. End the exercise because the players are too tired.',
        'B. Temporarily stop the action so positioning can be corrected.',
        'C. Reduce the intensity while allowing the exercise to continue.',
        'D. Repeat the exercise without giving any further instruction.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Third-man Run',
      context: 'The assistant coach says: “The midfielder plays into the striker, then the winger makes the third-man run beyond him.”',
      question: 'What is the “third-man run” in this sequence?',
      options: [
        'A. The striker moving toward the midfielder to receive the first pass.',
        'B. The midfielder following the pass to support behind the ball.',
        'C. The winger running beyond after two other players combine.',
        'D. The fullback moving inside to create an extra passing option.',
      ],
      correct: 'C',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Tactical Integrity',
      context:
        'The Head Coach says: “Raise the press if the trigger is there, but don’t compromise our rest defense. If the first line gets played through, we still need enough control behind the ball to prevent the counter.”',
      question: 'What does “compromise” mean in this context?',
      options: [
        'A. Make the defensive structure less effective or secure',
        'B. Delay the pressing action until more players recover',
        'C. Change the defensive structure to create greater attacking width',
        'D. Accept a temporary numerical disadvantage in order to press higher',
      ],
      correct: 'A',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Clarifying a Build-up Role',
      context: 'The head coach asks the fullback to move inside during the build-up. The player asks: “When exactly do you want me to come inside?”',
      question: 'Which explanation is clearest?',
      options: [
        'A. Move inside whenever you think the midfield needs more help.',
        'B. Start inside before the goalkeeper has decided where to pass.',
        'C. Stay wide until the winger moves, then copy his position.',
        'D. Move inside when the centre-back has the ball and the winger is holding the width.',
      ],
      correct: 'D',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Explaining the Purpose of Repetition',
      context: 'A player is frustrated because the same transition exercise is being repeated. He says: “We already understand it. Why are we doing it again?”',
      question: 'What is the most effective response?',
      options: [
        'A. We are repeating it because the head coach is not satisfied with the group.',
        'B. You understand the idea, but some players are still making basic mistakes.',
        'C. The idea is clear. Now we are repeating it so the reaction stays coordinated when you are tired.',
        'D. We can reduce the repetitions if everyone promises to concentrate more.',
      ],
      correct: 'C',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Prioritising Feedback',
      context: 'A midfielder has received several corrections during the exercise and now looks uncertain. You need to make the next repetition manageable.',
      question: 'Which response gives the most useful support?',
      options: [
        'A. Improve your body position, communication, scanning and speed of play.',
        'B. Focus on one thing: scan before the pass arrives so your next action is quicker.',
        'C. Forget the previous repetitions and play with more confidence.',
        'D. Try to remember everything the coaching staff has told you today.',
      ],
      correct: 'B',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Translating Tactical Intention',
      context: 'The head coach tells the midfield: “We need to control the rhythm instead of forcing the game.” One player asks what that should look like in possession.',
      question: 'Which clarification translates the intention most effectively?',
      options: [
        'A. Keep the ball for longer and avoid playing forward until the opposition drops back.',
        'B. Reduce the tempo of every attack so the team remains compact behind the ball.',
        'C. Take fewer risks, use shorter passes and wait for the head coach to signal when to attack.',
        'D. Scan before receiving: if pressure is disorganised, play forward; if it is set, recycle the ball and move them again.',
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
      level: 'Warm-Up',
      label: 'Item 1 — Training Load Monitoring',
      context: '',
      question: 'Which task is a core responsibility of a Fitness Coach?',
      options: [
        'A. Monitoring player workload and recovery.',
        'B. Preparing tactical opposition reports.',
        'C. Managing player contract discussions.',
        'D. Planning long-term academy recruitment.',
      ],
      correct: 'A',
    },
    {
      id: 'w2',
      level: 'Warm-Up',
      label: 'Item 2 — Readiness and Performance',
      context: '',
      question: 'What would a Fitness Coach typically report to the coaching staff before a match?',
      options: [
        'A. Opposition pressing and build-up patterns.',
        'B. Contract priorities for senior players.',
        'C. Player readiness and fatigue levels.',
        'D. Academy promotion and recruitment decisions.',
      ],
      correct: 'C',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Training Load',
      context:
        '“Today’s session was shorter than usual. The players completed fewer high-speed runs and had more recovery time between drills.”',
      question: 'What changed in today’s session?',
      options: [
        'A. The players completed more sprint work.',
        'B. The session included longer tactical drills.',
        'C. The physical load was reduced.',
        'D. The recovery periods were removed.',
      ],
      correct: 'C',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Player Readiness',
      context:
        '“Before training, one player reports heavy legs after the previous match. His wellness score is lower than normal, and his recent running load is above his weekly average.”',
      question: 'What should the Fitness Coach identify?',
      options: [
        'A. The player may need a reduced training load.',
        'B. The player should complete extra sprint work.',
        'C. The player is ready for maximum intensity.',
        'D. The player needs more tactical instruction.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Interpreting Physical Data',
      context:
        '“The team covered a similar total distance in both matches. However, in the second match, high-speed running increased significantly and repeated sprint efforts were more frequent.”',
      question: 'What does the comparison suggest?',
      options: [
        'A. Both matches created the same physical demands.',
        'B. The second match involved greater high-intensity demand.',
        'C. Total distance was much higher in the second match.',
        'D. The first match required more repeated sprint efforts.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Load vs Performance',
      context:
        '“Over the last three weeks, the player’s total training volume has remained relatively stable. However, his high-intensity exposure has increased, recovery scores have gradually declined, and his sprint output in training has started to fall.”',
      question: 'Which interpretation is best supported by the evidence?',
      options: [
        'A. Stable total volume means the player is adapting well.',
        'B. Lower sprint output is mainly a technical problem.',
        'C. The player needs more high-intensity work immediately.',
        'D. Increasing intensity may be affecting recovery and performance.',
      ],
      correct: 'D',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Recovery Between Efforts',
      audio: '/audio/diagnostics/fitness-coach/fitness-coach-listening-1.mp3',
      script:
        'Keep the next block controlled. We’re reducing the number of high-speed runs and giving the players more recovery between repetitions.',
      question: 'What is changing in the next block?',
      options: [
        'A. The players will complete more sprint efforts.',
        'B. The players will have longer recovery periods.',
        'C. The players will work with shorter rest periods.',
        'D. The players will increase the running distance.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Readiness Before Training',
      audio: '/audio/diagnostics/fitness-coach/fitness-coach-listening-2.mp3',
      script:
        'He says his legs still feel heavy this morning. His wellness score is also down, so I don’t want him completing the full high-intensity block today.',
      question: 'What is the Fitness Coach deciding?',
      options: [
        'A. The player should complete the session normally.',
        'B. The player needs additional technical work.',
        'C. The player’s high-intensity load should be reduced.',
        'D. The player should complete extra sprint training.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Match Demand',
      audio: '/audio/diagnostics/fitness-coach/fitness-coach-listening-3.mp3',
      script:
        'The total distance was almost identical to last week, but the profile was different. We had more high-speed actions and several repeated sprint sequences in the second half.',
      question: 'What is the main point?',
      options: [
        'A. The match involved greater high-intensity demand.',
        'B. The team covered significantly more total distance.',
        'C. The second half required less physical effort.',
        'D. The players completed fewer repeated sprint actions.',
      ],
      correct: 'A',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Accumulated Fatigue',
      audio: '/audio/diagnostics/fitness-coach/fitness-coach-listening-4.mp3',
      script:
        'I’m less concerned about the total volume than the pattern across the week. His high-intensity exposure has stayed high, his recovery markers have dropped for three consecutive days, and today his sprint output is below his normal range. One measure alone wouldn’t concern me, but together they suggest we should adjust his load.',
      question: 'Why does the Fitness Coach recommend adjusting the player’s load?',
      options: [
        'A. The player recorded one unusually low recovery score.',
        'B. The total weekly volume has increased significantly.',
        'C. The player has completed fewer training sessions this week.',
        'D. Several indicators together suggest accumulated fatigue.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Training Load',
      context:
        'The Fitness Coach says: “We reduced his training load today because he played 90 minutes yesterday.”',
      question: 'What does “training load” refer to?',
      options: [
        'A. The tactical role assigned during the session.',
        'B. The recovery time available after the session.',
        'C. The amount of physical work completed in training.',
        'D. The technical exercises selected by the coach.',
      ],
      correct: 'C',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — High-Speed Running',
      context:
        'The Fitness Coach says: “His high-speed running was lower than usual in today’s match.”',
      question: 'What does “high-speed running” describe?',
      options: [
        'A. Running completed during the warm-up period.',
        'B. Running performed above a defined speed threshold.',
        'C. Running completed while the team has possession.',
        'D. Running performed during continuous aerobic work.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Sprint Exposure',
      context:
        'The Fitness Coach says: “He has had limited sprint exposure this week, so we need to consider that before the match.”',
      question: 'What does “sprint exposure” mean here?',
      options: [
        'A. How often the player takes part in conditioning drills.',
        'B. How much distance the player covers during each session.',
        'C. How often the player reaches the end of a training block.',
        'D. How much the player has been exposed to sprint-speed efforts.',
      ],
      correct: 'D',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Internal Load',
      context:
        'The Fitness Coach says: “The external load was similar to last week, but his internal load was considerably higher.”',
      question: 'What does “internal load” refer to here?',
      options: [
        'A. The player’s physiological response to the physical demands.',
        'B. The physical work recorded through movement and running data.',
        'C. The training volume prescribed within the weekly program.',
        'D. The recovery time scheduled between demanding training sessions.',
      ],
      correct: 'A',
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
      label: 'Item 1 — Team Performance Analysis',
      context: '',
      question: 'Which task is a core responsibility of a Performance Analyst?',
      options: [
        'A. Monitoring rehabilitation and return-to-play plans.',
        'B. Reviewing video and data for performance patterns.',
        'C. Leading physical preparation during training sessions.',
        'D. Managing contracts and player salary discussions.',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Opposition Analysis',
      context: '',
      question: 'What would a Performance Analyst typically prepare before an upcoming match?',
      options: [
        'A. An opposition report on tactical patterns and weaknesses.',
        'B. A nutrition report on match-day fueling and hydration.',
        'C. A squad plan with the starting lineup and substitutes.',
        'D. A rehabilitation report with individual recovery targets.',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Match Pattern',
      context:
        'Match analysis:\n\n“After recovering possession, the team looked to play forward quickly. The winger moved into space and the striker attacked the gap between the center-backs.”',
      question: 'What happened after the team won the ball?',
      options: [
        'A. The team kept the ball and slowed the attack.',
        'B. The team attacked quickly after winning possession.',
        'C. The striker moved deeper to receive the ball.',
        'D. The winger moved closer to the opposing fullback.',
      ],
      correct: 'B',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Opposition Build-Up',
      context:
        'Opposition analysis:\n\n“The opponent builds with three players across the first line. When the right center-back carries the ball forward, the right fullback moves high and the nearest midfielder drops to receive.”',
      question: 'What should the analyst highlight to the coaching staff?',
      options: [
        'A. The goalkeeper regularly starts with a long pass.',
        'B. The right side changes its shape during build-up.',
        'C. The midfielder stays high during the attacking phase.',
        'D. The right fullback remains deep during possession.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Interpreting Evidence',
      context:
        'Match analysis:\n\n“The team completed fewer passes in the final third, but the video shows that the main problem occurred earlier. The midfield received under pressure and often played backward before the attacking line could establish good positions.”',
      question: 'What does the evidence suggest?',
      options: [
        'A. The main problem began with the attacking players.',
        'B. The team needed to use more crosses from wide areas.',
        'C. The progression problem started before the final third.',
        'D. The team attempted too many forward passes under pressure.',
      ],
      correct: 'C',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Tactical Interpretation',
      context:
        'Opposition analysis:\n\n“Across three matches, the opponent’s left fullback consistently advances early during possession. This gives them width and supports progression, but when possession is lost, the space behind him is often covered by the left center-back moving wide. The vulnerability appears greater when that center-back has already stepped forward to support midfield.”',
      question: 'Which conclusion is best supported by the analysis?',
      options: [
        'A. Space always appears behind the advancing left fullback.',
        'B. The left fullback represents their main defensive weakness.',
        'C. The space increases when the covering center-back steps forward.',
        'D. The center-back should remain deeper whenever the fullback advances.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Movement and Space',
      script:
        'Watch the winger here. He stays wide when the fullback receives the ball, and that opens space inside for the midfielder to move forward.',
      question: 'What does the winger’s position create?',
      options: [
        'A. Space inside for the midfielder to move forward.',
        'B. Space outside for the fullback to move forward.',
        'C. Pressure higher up for the striker to press.',
        'D. Protection deeper for the defenders to recover.',
      ],
      correct: 'A',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Pressing Trigger',
      script:
        'They don’t press every pass. But when the ball goes back to the center-back, the midfield line steps forward and the striker presses again. That backward pass is their trigger.',
      question: 'What triggers the opponent’s press?',
      options: [
        'A. A forward pass played directly into midfield.',
        'B. A backward pass played toward the center-back.',
        'C. A long pass played forward by the goalkeeper.',
        'D. An inside movement made by the wide fullback.',
      ],
      correct: 'B',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Possession vs Control',
      script:
        'We had more possession after halftime, but most of it was in our own half. They stopped pressing us high, protected the middle, and allowed us to circulate the ball without really progressing.',
      question: 'What is the analyst explaining?',
      options: [
        'A. More possession gave the team greater attacking control.',
        'B. Less pressing allowed the opponent to attack more often.',
        'C. More possession did not produce better forward progression.',
        'D. Deeper circulation created more chances after halftime.',
      ],
      correct: 'C',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Beyond the Final Error',
      script:
        'At first, the turnovers looked like individual passing errors. But when we reviewed the sequences, the same situation kept appearing. The player receiving the ball had very few forward options because the distance between midfield and the attacking line had increased. So the technical error was often the final action, rather than the origin of the problem.',
      question: 'What is the analyst’s main conclusion?',
      options: [
        'A. Risky passing decisions were causing most turnovers.',
        'B. Poor passing technique was causing most turnovers.',
        'C. Poor team spacing was contributing to the turnovers.',
        'D. Deeper attacking positions were contributing to the turnovers.',
      ],
      correct: 'C',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Defensive Line',
      context:
        'The analyst says: “Their defensive line stays very high when they have the ball.”',
      question: 'What does “defensive line” refer to?',
      options: [
        'A. The defenders positioned across the back of the team.',
        'B. The midfielders positioned across the center of the team.',
        'C. The attackers positioned closest to the opponent’s goal.',
        'D. The players positioned around the goalkeeper in build-up.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Progressive Pass',
      context:
        'The analyst says: “The key action was the progressive pass into the final third.”',
      question: 'What is a “progressive pass”?',
      options: [
        'A. A pass that maintains possession in the current area.',
        'B. A pass that moves possession significantly closer to goal.',
        'C. A pass that changes possession from one side to another.',
        'D. A pass that follows immediately after winning possession.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Break the Line',
      context:
        'The analyst says: “We struggled to break the midfield line because our center-backs had very few forward passing options.”',
      question: 'What does “break the line” mean here?',
      options: [
        'A. Move the opposition deeper through sustained possession.',
        'B. Move beyond an opposition line through passing or movement.',
        'C. Change defensive structure immediately after losing possession.',
        'D. Increase the distance between two units during possession.',
      ],
      correct: 'B',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Underlying Pattern',
      context:
        'The analyst says: “The turnover itself is obvious, but the underlying pattern starts earlier, when our midfield and front line become disconnected.”',
      question: 'What does “underlying pattern” mean here?',
      options: [
        'A. A recurring structural issue behind the visible outcome.',
        'B. A decisive technical action producing the visible outcome.',
        'C. A statistical trend appearing only in post-match data.',
        'D. A repeated individual error producing the same outcome.',
      ],
      correct: 'A',
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
      level: 'Warm-Up',
      label: 'Item 1 — Injury Assessment',
      context: '',
      question: 'Which task is a core responsibility of a Physiotherapist?',
      options: [
        'A. Assessing injuries and planning rehabilitation.',
        'B. Preparing tactical opposition reports.',
        'C. Managing player contract discussions.',
        'D. Designing squad nutrition strategies.',
      ],
      correct: 'A',
    },
    {
      id: 'w2',
      level: 'Warm-Up',
      label: 'Item 2 — Return-to-Play Communication',
      context: '',
      question: 'What would a Physiotherapist typically report to the coaching staff?',
      options: [
        'A. Opposition attacking patterns and set pieces.',
        'B. Recruitment priorities for the next window.',
        'C. Injury status and return-to-play progress.',
        'D. Weekly conditioning targets for the squad.',
      ],
      correct: 'C',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Initial Injury Note',
      context:
        'Medical note:\n\n“After training, the player reports pain around the ankle. There is some swelling, and he finds it difficult to move the joint normally. The physiotherapist decides that he should not take part in team training during the weekend.”',
      question: 'What should the player do now?',
      options: [
        'A. Avoid team training for the weekend.',
        'B. Complete a normal running session.',
        'C. Join the full training session.',
        'D. Start high-intensity gym work.',
      ],
      correct: 'A',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Rehabilitation Progress',
      context:
        'Rehab update:\n\n“The player is recovering from a Grade 1 hamstring strain. He has progressed from strength work to controlled running. He can now run comfortably at moderate speed, but high-speed work has not started yet.”',
      question: 'What does the update show?',
      options: [
        'A. The player is ready to return to competition.',
        'B. Rehabilitation is progressing but is not complete.',
        'C. Running should stop until all strength work ends.',
        'D. High-speed work has already been completed.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Fear of Re-Injury',
      context:
        'Case note:\n\n“The player continues to report knee discomfort, although imaging does not fully explain the symptoms. During rehabilitation, he moves more cautiously when he expects pain and says he is worried about damaging the knee again. The medical team plans to continue physical rehabilitation while also addressing confidence.”',
      question: 'What does the case suggest?',
      options: [
        'A. Imaging should determine the entire rehabilitation plan.',
        'B. Physical progress should stop until confidence improves.',
        'C. Physical and psychological factors should be managed together.',
        'D. The player can return because no major damage is visible.',
      ],
      correct: 'C',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Return-to-Play Readiness',
      context:
        'Case note:\n\n“The player has completed two full training sessions without pain and reports high confidence. Strength testing is close to his pre-injury level. However, during repeated high-speed actions, his output decreases more than expected and movement quality begins to change. The coaching staff would like him available for the next match.”',
      question: 'Which interpretation is best supported by the evidence?',
      options: [
        'A. Pain-free training is sufficient to confirm match readiness.',
        'B. High confidence makes the remaining physical deficit less relevant.',
        'C. Match importance should determine whether the player is cleared.',
        'D. Repeated high-speed performance still needs consideration before return.',
      ],
      correct: 'D',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Symptom Report',
      audio: '/audio/diagnostics/physiotherapist/physiotherapist-listening-1.mp3',
      script:
        'The player reports pain at the back of his left thigh. It started near the end of training during an acceleration. Walking is comfortable, but faster running increases the discomfort.',
      question: 'When does the player feel the problem most?',
      options: [
        'A. During normal walking.',
        'B. During faster running.',
        'C. During seated recovery.',
        'D. During ankle movement.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Graduated Return',
      audio: '/audio/diagnostics/physiotherapist/physiotherapist-listening-2.mp3',
      script:
        'The player has completed controlled running and change-of-direction work without pain. Today we will introduce higher-speed running. If he responds well, the next step will be partial team training later this week.',
      question: 'What is the next stage of rehabilitation?',
      options: [
        'A. Return directly to match play.',
        'B. Stop running and use gym work only.',
        'C. Introduce higher-speed running before team training.',
        'D. Begin full team training immediately.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Response to Increased Load',
      audio: '/audio/diagnostics/physiotherapist/physiotherapist-listening-3.mp3',
      script:
        'Yesterday we increased the player’s running intensity. He completed the session, but this morning he reports more stiffness and his strength test is slightly below the previous reading. We do not need to stop the whole program, but today’s load should be adjusted and his response reassessed.',
      question: 'What is the recommended action?',
      options: [
        'A. Adjust today’s load and monitor the response.',
        'B. Return the player to full training immediately.',
        'C. Stop rehabilitation until all stiffness disappears.',
        'D. Continue with the same load because he finished yesterday.',
      ],
      correct: 'A',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Return-to-Play Readiness',
      audio: '/audio/diagnostics/physiotherapist/physiotherapist-listening-4.mp3',
      script:
        'The player is pain-free in normal training and his strength numbers are close to baseline. The concern appears when demanding actions are repeated. During the final high-speed block, his output drops and his movement becomes less controlled. Pain and one strength score are not enough to determine readiness. We still need to evaluate how he responds when match demands accumulate.',
      question: 'What is the main concern?',
      options: [
        'A. Pain is still present during normal training.',
        'B. Basic strength remains far below baseline.',
        'C. Performance changes under repeated high-speed demands.',
        'D. The player has not completed enough technical work.',
      ],
      correct: 'C',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Range of Motion',
      context:
        'The physiotherapist says: “His range of motion is still limited after the ankle injury.”',
      question: 'What does “range of motion” mean?',
      options: [
        'A. How much a joint can move.',
        'B. How fast a player can run.',
        'C. How long a player can train.',
        'D. How much weight a player can lift.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Load Tolerance',
      context:
        'The physiotherapist says: “We need to check his load tolerance before we increase the running work.”',
      question: 'What does “load tolerance” mean here?',
      options: [
        'A. How quickly the player completes each exercise.',
        'B. How well the player handles physical demand.',
        'C. How much pain the player reports after treatment.',
        'D. How often the player trains with the squad.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Asymmetry',
      context:
        'The physiotherapist says: “There is still some asymmetry between the injured and uninjured sides during strength testing.”',
      question: 'What does “asymmetry” mean here?',
      options: [
        'A. A difference between the two sides.',
        'B. A decrease in overall training volume.',
        'C. A change in the player’s movement speed.',
        'D. An increase in pain during rehabilitation.',
      ],
      correct: 'A',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Baseline',
      context:
        'The physiotherapist says: “His strength is close to baseline, but repeated high-speed work still changes his movement quality.”',
      question: 'What does “baseline” refer to here?',
      options: [
        'A. The minimum level needed to begin rehabilitation.',
        'B. The player’s normal reference level before the injury.',
        'C. The target level set for the next training session.',
        'D. The average result recorded across the whole squad.',
      ],
      correct: 'B',
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
      label: 'Item 1 — Player Support',
      context: '',
      question: 'Which task is a core responsibility of a Sports Psychologist?',
      options: [
        'A. Supporting confidence and performance behavior.',
        'B. Planning weekly training load.',
        'C. Preparing opposition reports.',
        'D. Managing recruitment decisions.',
      ],
      correct: 'A',
    },
    {
      id: 'w2',
      label: 'Item 2 — Staff Communication',
      context: '',
      question: 'What would a Sports Psychologist typically discuss with coaching staff?',
      options: [
        'A. Player support and mental readiness.',
        'B. Recruitment targets for the next window.',
        'C. Weekly running-load objectives.',
        'D. Opposition set-piece organization.',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Confidence After a Difficult Match',
      context: 'Player note:\n\n“After the match, the player says he feels disappointed because he missed two good chances. He is still talking normally with teammates and wants to train tomorrow. His confidence is lower than usual, but he wants to improve.”',
      question: 'What does the note show?',
      options: [
        'A. The player wants to stop training for several days.',
        'B. The player is disappointed but remains engaged.',
        'C. The player is avoiding contact with the team.',
        'D. The player is showing serious medical symptoms.',
      ],
      correct: 'B',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Pre-Match Pressure',
      context: 'Case note:\n\n“Before important matches, the player becomes tense and starts thinking about possible mistakes. His breathing becomes faster and he finds it harder to focus on his normal routine. The psychologist wants to introduce a simple breathing strategy and a more realistic way of thinking about mistakes.”',
      question: 'What is the main aim of the intervention?',
      options: [
        'A. Help the player manage pressure and maintain focus.',
        'B. Reduce his responsibility during important matches.',
        'C. Remove all difficult thoughts before kick-off.',
        'D. Change his technical preparation before the match.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Psychological Readiness After Injury',
      context: 'Case note:\n\n“The player has met the main physical criteria for his return and has completed two full team sessions without pain. However, during high-intensity drills he remains hesitant when movements resemble the mechanism of his previous injury. He occasionally reduces his speed before contact and reports that he is still anticipating another setback. The medical staff have found no new physical restriction.”',
      question: 'What is the most appropriate interpretation?',
      options: [
        'A. His hesitation indicates that physical rehabilitation was incomplete.',
        'B. His current behavior may reflect residual fear of re-injury.',
        'C. His training exposure should remain unchanged until confidence returns.',
        'D. His medical clearance confirms full readiness for competition.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Confidentiality and Performance Support',
      context: 'Case note:\n\n“A senior player privately tells the Sports Psychologist that increasing criticism from outside the club and pressure from his family are affecting his concentration and emotional regulation. He does not want the details shared with the coaching staff because he fears being perceived as mentally weak. During the weekly staff meeting, however, the Head Coach reports changes in the player’s behavior and asks whether there is a problem that should influence his workload, communication or match preparation.”',
      question: 'Which response best balances the psychologist’s professional responsibilities?',
      options: [
        'A. Disclose the underlying concerns because they may influence sporting decisions.',
        'B. Reassure the coach that no intervention is necessary without player consent.',
        'C. Protect sensitive details while communicating relevant functional implications.',
        'D. Ask the player to explain the situation directly before advising the staff.',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Confidence After a Mistake',
      script: 'The player is frustrated after missing a penalty. He says his confidence is lower, but he still wants to train and prepare for the next match. I think we should help him focus on what he can control.',
      question: 'What does the psychologist recommend?',
      options: [
        'A. Give the player extra physical training.',
        'B. Help the player focus on controllable actions.',
        'C. Keep the player away from the next match.',
        'D. Avoid discussing the missed penalty.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Managing Pre-Match Pressure',
      script: 'The player becomes very tense before important matches. He starts thinking about mistakes and loses concentration during his normal preparation. We are going to use a short breathing routine and help him focus on two simple performance cues before kick-off.',
      question: 'What is the purpose of the plan?',
      options: [
        'A. Reduce the player’s tactical responsibility.',
        'B. Change his routine before every training session.',
        'C. Help him regulate pressure and maintain attention.',
        'D. Prevent him from thinking about the match.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Confidence During Return to Play',
      script: 'Physically, the player has progressed well and the medical staff are satisfied with his rehabilitation. The main issue now appears when he performs movements similar to the original injury. He becomes more cautious, reduces his intensity and says he is expecting something to go wrong. That response needs to be considered alongside the physical criteria.',
      question: 'What is the psychologist highlighting?',
      options: [
        'A. Psychological readiness remains relevant to his return.',
        'B. The medical criteria should be reassessed immediately.',
        'C. Training intensity is the cause of his hesitation.',
        'D. Physical clearance should determine match availability.',
      ],
      correct: 'A',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Supporting Performance Without Overstepping',
      script: 'The player’s recent drop in concentration does not appear to come from a lack of motivation. He is managing several sources of pressure and has become increasingly concerned about how mistakes are perceived by others. The coaching staff do not need access to every personal detail, but they may need guidance on how their communication and expectations are affecting his ability to perform consistently.',
      question: 'What is the central professional judgment?',
      options: [
        'A. Personal information should be shared when performance declines.',
        'B. The player should manage external pressure independently.',
        'C. Staff communication should remain unchanged without full disclosure.',
        'D. Relevant guidance can be shared without revealing sensitive details.',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Frustrated',
      context: 'The player says: “I’m frustrated because I keep making the same mistakes.”',
      question: 'What does frustrated mean here?',
      options: [
        'A. Feeling calm before an important match.',
        'B. Feeling annoyed because progress is difficult.',
        'C. Feeling tired after a demanding session.',
        'D. Feeling ready to return after an injury.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Overwhelmed',
      context: 'The player says: “Everything feels too much right now. I’m overwhelmed.”',
      question: 'What does overwhelmed mean here?',
      options: [
        'A. Unwilling to follow the coach’s instructions.',
        'B. Unsure about the team’s tactical structure.',
        'C. Uncomfortable because of physical fatigue.',
        'D. Unable to manage the amount of pressure.',
      ],
      correct: 'D',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Self-Doubt',
      context: 'The psychologist says: “After several poor performances, the player is showing more self-doubt.”',
      question: 'What does self-doubt mean here?',
      options: [
        'A. Uncertainty about his own ability to perform.',
        'B. Disagreement with the coach’s tactical decisions.',
        'C. Concern about another player’s behavior.',
        'D. Difficulty understanding the training plan.',
      ],
      correct: 'A',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Emotional Suppression',
      context: 'The report says: “The player appears composed in front of staff, but privately describes persistent anger and anxiety. He is increasingly suppressing these reactions rather than processing them, and this seems to be affecting his concentration during matches.”',
      question: 'What does emotional suppression imply in this context?',
      options: [
        'A. The player is successfully reducing emotional intensity.',
        'B. The player is preventing emotions from affecting performance.',
        'C. The player is concealing emotional responses without resolving them.',
        'D. The player is becoming less emotionally involved in competition.',
      ],
      correct: 'C',
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

function calculateResult(
  assessmentItems: typeof items,
  answers: Record<string, Answer>,
  writingScore: number,
  speakingScore: number,
  role: string
): Result {
  const usesProgressiveDiagnostic =
    role === 'Professional Player' ||
    role === 'Head Coach' ||
    role === 'Assistant Coach' ||
    role === 'Performance Analyst'

  const objectiveItems = usesProgressiveDiagnostic
    ? [
        ...assessmentItems.reading,
        ...assessmentItems.listening,
        ...assessmentItems.vocabulary,
      ]
    : [
        ...assessmentItems.reading,
        ...assessmentItems.listening,
        ...assessmentItems.vocabulary,
        ...assessmentItems.functional,
      ]

  const objectiveScore = objectiveItems.filter((item) => {
    const answer = answers[item.id]
    return answer && answer.startsWith(item.correct)
  }).length

  const maxObjective = usesProgressiveDiagnostic ? 12 : 13
  const totalScore = objectiveScore + writingScore + speakingScore
  const maxScore = maxObjective + 4 + 4

  let level: 'A2' | 'B1' | 'B2' | 'C1' = 'A2'

  if (usesProgressiveDiagnostic) {
    const countCorrect = (
      itemsToCheck: Array<{ id: string; correct: string } | undefined>
    ) =>
      itemsToCheck.filter(
        (item) => item && answers[item.id]?.startsWith(item.correct)
      ).length

    const a2Score = countCorrect([
      assessmentItems.reading[0],
      assessmentItems.listening[0],
      assessmentItems.vocabulary[0],
    ])

    const b1Score = countCorrect([
      assessmentItems.reading[1],
      assessmentItems.listening[1],
      assessmentItems.vocabulary[1],
    ])

    const b2Score = countCorrect([
      assessmentItems.reading[2],
      assessmentItems.listening[2],
      assessmentItems.vocabulary[2],
    ])

    const c1Score = countCorrect([
      assessmentItems.reading[3],
      assessmentItems.listening[3],
      assessmentItems.vocabulary[3],
    ])

    if (
      a2Score >= 2 &&
      b1Score >= 2 &&
      b2Score >= 2 &&
      c1Score >= 2 &&
      (writingScore === 4 || speakingScore === 4)
    ) {
      level = 'C1'
    } else if (
      a2Score >= 2 &&
      b1Score >= 2 &&
      b2Score >= 2
    ) {
      level = 'B2'
    } else if (
      a2Score >= 2 &&
      b1Score >= 2
    ) {
      level = 'B1'
    }
  } else {
    const a2Items = [
      assessmentItems.reading[0],
      assessmentItems.listening[0],
      assessmentItems.vocabulary[0],
    ]

    const b1Items = [
      assessmentItems.reading[1],
      assessmentItems.listening[1],
      assessmentItems.vocabulary[1],
      assessmentItems.functional[0],
    ]

    const b2Items = [
      assessmentItems.reading[2],
      assessmentItems.listening[2],
      assessmentItems.vocabulary[2],
      assessmentItems.functional[1],
      assessmentItems.functional[2],
    ]

    const c1Item = assessmentItems.functional[3]

    const a2Score = a2Items.filter(
      (item) => answers[item.id]?.startsWith(item.correct)
    ).length

    const b1Score = b1Items.filter(
      (item) => answers[item.id]?.startsWith(item.correct)
    ).length

    const b2Score = b2Items.filter(
      (item) => answers[item.id]?.startsWith(item.correct)
    ).length

    const c1Correct =
      c1Item && answers[c1Item.id]?.startsWith(c1Item.correct)

    if (
      c1Correct &&
      b2Score >= 4 &&
      (writingScore === 4 || speakingScore === 4)
    ) {
      level = 'C1'
    } else if (b2Score >= 3 && b1Score >= 3) {
      level = 'B2'
    } else if (b1Score >= 3 && a2Score >= 2) {
      level = 'B1'
    }
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
        <span className="font-semibold text-fei-bg/78">
          {option.slice(0, 2)}
        </span>
        <span>
          {option.slice(2)}
        </span>
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

      <div className={minimal ? 'mb-3' : 'mb-5'}>
        <p
          className={
            minimal
              ? 'text-xs leading-5 text-fei-bg/48'
              : 'text-sm leading-6 text-fei-bg/55'
          }
        >
          Click play to hear the audio clip. You may listen up to 2 times.
        </p>

        {minimal && (
          <p className="mt-1 text-[11px] font-normal leading-5 text-fei-bg/38">
            Use headphones for best results.
          </p>
        )}
      </div>

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
  const assessmentAvailable = selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Academy Director' || selectedRole === 'Head of Scouting' || selectedRole === 'Scout' || selectedRole === 'Fitness Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Nutritionist' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist'
  const activeItems = selectedRole === 'Head Coach' ? headCoachItems : selectedRole === 'Assistant Coach' ? assistantCoachItems : selectedRole === 'Academy Director' ? academyDirectorItems : selectedRole === 'Head of Scouting' ? headOfScoutingItems : selectedRole === 'Scout' ? scoutItems : selectedRole === 'Fitness Coach' ? fitnessCoachItems : selectedRole === 'Performance Analyst' ? performanceAnalystItems : selectedRole === 'Nutritionist' ? nutritionistItems : selectedRole === 'Physiotherapist' ? physiotherapistItems : selectedRole === 'Sports Psychologist' ? sportsPsychologistItems : items
  const roleSubtitle = selectedRole === 'Academy Director' ? 'Youth & Academy' : selectedRole === 'Head of Scouting' ? 'Recruitment Leadership' : selectedRole === 'Scout' ? 'First Team Recruitment' : selectedRole === 'Fitness Coach' ? 'Strength & Conditioning' : selectedRole === 'Performance Analyst' ? 'First Team Analysis' : selectedRole === 'Nutritionist' ? 'Performance Nutrition' : selectedRole === 'Physiotherapist' ? 'Medical & Rehabilitation' : selectedRole === 'Sports Psychologist' ? 'Mental Performance' : selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' ? 'First Team' : 'Senior Squad'

  const [section, setSection] = useState<Section>('intro')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [warmupStep, setWarmupStep] = useState(0)

  useEffect(() => {
    const avatarSources = [
      '/images/diagnostics/avatars/coach.png',
      '/images/diagnostics/avatars/teammate.png',
      '/images/diagnostics/avatars/physiotherapist.png',
      '/images/diagnostics/avatars/assistant-coach.png',
      '/images/diagnostics/avatars/sporting-director.png',
      '/images/diagnostics/avatars/analyst.png',
    ]

    avatarSources.forEach((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
    })
  }, [])
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
  const uses16ItemDiagnostic =
    selectedRole === 'Professional Player' ||
    selectedRole === 'Head Coach' ||
    selectedRole === 'Assistant Coach' ||
    selectedRole === 'Performance Analyst' ||
    selectedRole === 'Fitness Coach' ||
    selectedRole === 'Physiotherapist'
  const totalItems = uses16ItemDiagnostic ? 16 : 17

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
    const res = calculateResult(activeItems, answers, wScore, spScore, selectedRole)
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
    const map: Record<string, number> =
      (selectedRole === 'Professional Player' ||
        selectedRole === 'Head Coach' ||
        selectedRole === 'Assistant Coach' ||
        selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach')
        ? {
            'warm-up': step + 1,
            'reading': step + 3,
            'listening': step + 7,
            'vocabulary': step + 11,
            'functional': step + 15,
            'writing': 15,
            'speaking': 16,
          }
        : {
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

        <main
          className={`mx-auto w-full px-6 sm:px-8 ${
            (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
              ? 'max-w-[1080px] py-5 lg:py-6'
              : 'max-w-[1280px] py-8 lg:py-10'
          }`}
        >
          <div className={(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? 'mb-5' : 'mb-10'}>
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

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                <SectionBadge label="Role Warm-Up" />
              ) : (
                <>
                  <div className="h-1 w-20 rounded-full bg-fei-sky" />

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-fei-bg/45">
                    Role Warm-Up
                  </p>
                </>
              )}

            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'max-w-[840px]'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                <>
                  {(selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                    <div className="mb-4">
                      <h1 className="max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl">
                        {item.question}
                      </h1>
                    </div>
                  ) : (
                    <div className="mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.025)]">
                      <div className="border-l-[3px] border-fei-sky px-5 py-4 sm:px-6">
                        <p className="max-w-[760px] text-[17px] font-medium leading-7 tracking-[-0.008em] text-fei-bg/82 sm:text-[18px]">
                          {item.context}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-l-4 border-fei-sky pl-5 sm:pl-7">
                  <h1 className="max-w-3xl text-3xl font-black leading-[1.15] tracking-[-0.035em] text-fei-bg sm:text-4xl">
                    {item.context}
                  </h1>

                  <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-fei-bg/72 sm:text-lg">
                    {item.question}
                  </p>
                </div>
              )}

              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                <div className="mb-4 overflow-hidden border-y border-fei-bg/[0.08]">
                  {item.options.map((option) => (
                    <OptionButton
                      key={option}
                      option={option}
                      selected={selected === option}
                      onSelect={() => setAnswer(item.id, option)}
                      refined
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-9 overflow-hidden border-y border-fei-bg/10">
                  {item.options.map((option) => (
                    <OptionButton
                      key={option}
                      option={option}
                      selected={selected === option}
                      onSelect={() => setAnswer(item.id, option)}
                    />
                  ))}
                </div>
              )}

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? 'pb-6' : 'mt-8'
                }`}
              >
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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">

          <ProgressBar
            current={getItemNumber('reading', readingStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Professional Reading" />
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                <>
                  <div className="mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.025)]">
                    <div className="px-5 py-4 sm:px-6">
                      {selectedRole === 'Fitness Coach' ? (
                        <p className="max-w-[760px] whitespace-pre-line text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72 select-none">
                          {item.context}
                        </p>
                      ) : (
                        <>
                          <p className="mb-2 text-[11px] font-normal uppercase tracking-[0.08em] text-fei-bg/42">
                            {item.context.split('\n\n')[0]}
                          </p>

                          <p className="max-w-[760px] whitespace-pre-line text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72 select-none">
                            {item.context.split('\n\n').slice(1).join('\n\n')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      selectedRole === 'Professional Player'
                        ? 'mb-4 border-l-[3px] border-fei-sky pl-4 sm:pl-5'
                        : 'mb-3'
                    }
                  >
                    <h1
                      className={
                        selectedRole === 'Professional Player'
                          ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                          : 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                      }
                    >
                      {item.question}
                    </h1>
                  </div>
                </>
              ) : selectedRole === 'Assistant Coach' ? (
                <>
                  <div className="mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.025)]">
                    <div className="px-5 py-4 sm:px-6">
                      <p className="mb-2 text-[11px] font-normal uppercase tracking-[0.08em] text-fei-bg/42">
                        {item.context.split('\n\n')[0]}
                      </p>

                      <p className="max-w-[760px] whitespace-pre-line text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/78 select-none sm:text-base">
                        {item.context.split('\n\n').slice(1).join('\n\n')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 border-l-[3px] border-fei-sky pl-4 sm:pl-5">
                    <h1 className="max-w-[760px] text-xl font-medium leading-8 tracking-[-0.012em] text-fei-bg/88 sm:text-2xl">
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist'}
                  />
                ))}
              </div>

              <div className={`flex justify-end ${
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? 'pb-6' : ''
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
        </main>
      </div>
    )
  }

  // LISTENING
  if (section === 'listening') {
    const item = activeItems.listening[listeningStep]
    const selected = answers[item.id]

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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">

          <ProgressBar
            current={getItemNumber('listening', listeningStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Listening in Context" />

            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'max-w-[840px] lg:-translate-y-4'
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
                      : selectedRole === 'Head Coach'
                        ? `/audio/diagnostics/head-coach/head-coach-listening-${listeningStep + 1}.mp3`
                        : selectedRole === 'Assistant Coach'
                          ? `/audio/diagnostics/assistant-coach/assistant-coach-listening-${listeningStep + 1}.mp3`
                          : selectedRole === 'Performance Analyst'
                            ? `/audio/diagnostics/performance-analyst/performance-analyst-listening-${listeningStep + 1}.mp3`
                            : selectedRole === 'Fitness Coach'
                              ? `/audio/diagnostics/fitness-coach/fitness-coach-listening-${listeningStep + 1}.mp3`
                              : selectedRole === 'Physiotherapist'
                                ? `/audio/diagnostics/physiotherapist/physiotherapist-listening-${listeningStep + 1}.mp3`
                                : undefined
                  }
                  minimal={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist'}
                />

              </div>

              <div
                className={
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                    ? 'mb-3'
                    : 'mb-5 border-l-4 border-fei-sky pl-5 sm:pl-6'
                }
              >
                <h1
                  className={
                    selectedRole === 'Professional Player'
                      ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                      : selectedRole === 'Head Coach'
                        ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                        : selectedRole === 'Performance Analyst'
                          ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                          : selectedRole === 'Fitness Coach' ||
                              selectedRole === 'Physiotherapist'
                            ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                            : selectedRole === 'Assistant Coach'
                          ? 'max-w-[780px] text-lg font-medium leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                          : 'max-w-[780px] text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl'
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? 'pb-6' : ''
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
        </main>
      </div>
    )
  }

  // VOCABULARY
  if (section === 'vocabulary') {
    const item = activeItems.vocabulary[vocabStep]
    const selected = answers[item.id]

    const vocabularyContext = item.context.toLowerCase()

    const professionalPlayerVocabularySpeakers: Record<
      string,
      { speaker: string; avatar: string }
    > = {
      v1: {
        speaker: 'Teammate',
        avatar: '/images/diagnostics/avatars/teammate.png',
      },
      v2: {
        speaker: 'Coach',
        avatar: '/images/diagnostics/avatars/coach.png',
      },
      v3: {
        speaker: 'Physiotherapist',
        avatar: '/images/diagnostics/avatars/physiotherapist.png',
      },
      v4: {
        speaker: 'Analyst',
        avatar: '/images/diagnostics/avatars/analyst.png',
      },
    }

    const fixedProfessionalPlayerSpeaker =
      selectedRole === 'Professional Player'
        ? professionalPlayerVocabularySpeakers[item.id]
        : undefined

    const vocabularySpeaker =
      fixedProfessionalPlayerSpeaker?.speaker ??
      (vocabularyContext.includes('sporting director')
        ? 'Sporting Director'
        : vocabularyContext.includes('analyst')
          ? 'Analyst'
          : vocabularyContext.includes('assistant coach')
            ? 'Assistant Coach'
            : vocabularyContext.includes('physiotherapist')
              ? 'Physiotherapist'
              : vocabularyContext.includes('player asks')
                ? 'Player'
                : vocabularyContext.includes('coach')
                  ? 'Coach'
                  : vocabularyContext.includes('teammate')
                    ? 'Teammate'
                    : 'Match context')

    const vocabularyQuoteMatch = item.context.match(/[“"](.+)[”"]$/)
    const vocabularyQuote = vocabularyQuoteMatch?.[1] ?? item.context

    const vocabularySetup = item.context
      .replace(
        /\s*(?:A teammate shouts|A player asks|The coach says|The physiotherapist (?:asks|says)|The assistant coach says|The Sporting Director says|The analyst says):\s*[“"].*[”"]$/i,
        '',
      )
      .trim()

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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">
          <ProgressBar
            current={getItemNumber('vocabulary', vocabStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Football Vocabulary" />
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? (
                <>
                  <div className="mb-4">
                    {vocabularySetup &&
                      selectedRole !== 'Performance Analyst' &&
                      selectedRole !== 'Fitness Coach' && (
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
                          key={`${selectedRole}-${item.id}-${vocabularySpeaker}`}
                          src={
                            fixedProfessionalPlayerSpeaker?.avatar ??
                            (vocabularySpeaker === 'Physiotherapist'
                              ? '/images/diagnostics/avatars/physiotherapist.png'
                              : vocabularySpeaker === 'Assistant Coach'
                                ? '/images/diagnostics/avatars/assistant-coach.png'
                                : vocabularySpeaker === 'Sporting Director'
                                  ? '/images/diagnostics/avatars/sporting-director.png'
                                  : vocabularySpeaker === 'Coach'
                                    ? '/images/diagnostics/avatars/coach.png'
                                    : '/images/diagnostics/avatars/teammate.png')
                          }
                          alt={`${vocabularySpeaker} avatar`}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
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

                        <p className="text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/76 select-none sm:text-base">
                          “{vocabularyQuote}”
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl">
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist') ? 'pb-6' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) return
                    if (vocabStep < activeItems.vocabulary.length - 1) {
                      setVocabStep(vocabStep + 1)
                    } else if (
                      selectedRole === 'Professional Player' ||
                      selectedRole === 'Head Coach' ||
                      selectedRole === 'Assistant Coach' ||
                      selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist'
                    ) {
                      setSection('writing')
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
                        : (selectedRole === 'Professional Player' ||
                            selectedRole === 'Head Coach' ||
                            selectedRole === 'Assistant Coach' ||
                            selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                          ? 'Continue to Writing'
                          : 'Continue to Functional Communication'}
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

  // FUNCTIONAL COMMUNICATION
  if (section === 'functional') {
    const item = activeItems.functional[functionalStep]
    const selected = answers[item.id]

    const functionalQuoteMatch = item.context.match(/[“"]([^”"]+)[”"]/)
    const functionalQuote = functionalQuoteMatch?.[1] ?? ''
    const functionalSetup = functionalQuoteMatch
      ? item.context
          .replace(functionalQuoteMatch[0], '')
          .replace(/\s+/g, ' ')
          .trim()
      : item.context

    const functionalScenarioLabel =
      item.level === 'C1'
        ? 'Tactical mediation'
        : functionalStep === 0
          ? 'Player question'
          : functionalStep === 1
            ? 'Coaching moment'
            : 'Individual feedback'

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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">
          <ProgressBar
            current={getItemNumber('functional', functionalStep)}
            total={totalItems}
          />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Functional Communication" />
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach')
                  ? 'min-w-0 max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach') ? (
                <>
                  <div className="mb-4 w-full max-w-full overflow-hidden rounded-xl border border-fei-bg/[0.09] bg-white">
                    <div className="min-w-0 border-l-2 border-fei-sky px-5 py-4 sm:px-6">
                      <p className="max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72 select-none">
                        {item.context}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl">
                      {item.question}
                    </h1>
                  </div>
                </>
              ) : selectedRole === 'Assistant Coach' ? (
                <>
                  <div className="mb-5 overflow-hidden rounded-2xl border border-fei-bg/[0.10] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.035)]">
                    <div className="border-t-[3px] border-fei-sky px-5 py-5 sm:px-6 sm:py-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fei-bg/38">
                        {functionalScenarioLabel}
                      </p>

                      <p className="mt-3 max-w-[760px] text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/70 select-none sm:text-base">
                        {functionalSetup}
                      </p>

                      {functionalQuote && (
                        <div className="mt-4 rounded-xl bg-fei-bg/[0.035] px-4 py-3.5 sm:px-5">
                          <p className="text-[15px] font-medium leading-7 tracking-[-0.006em] text-fei-bg/86 select-none sm:text-base">
                            “{functionalQuote}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <h1 className="max-w-[780px] text-2xl font-black leading-tight tracking-[-0.025em] text-fei-bg sm:text-3xl">
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach') ? 'pb-6' : ''
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
        </main>
      </div>
    )
  }

  // WRITING
  if (section === 'writing') {
    const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0

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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">
          <ProgressBar current={getItemNumber('writing', 0)} total={totalItems} />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Written Production" />
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'min-w-0 max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)] sm:px-6'
                : selectedRole === 'Assistant Coach'
                  ? 'mb-5 overflow-hidden rounded-2xl border border-fei-bg/[0.10] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.035)]'
                  : 'mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7'
            }
          >
            {selectedRole === 'Assistant Coach' && (
              <div className="flex flex-wrap items-center gap-2 border-b border-fei-bg/[0.07] px-5 py-3 sm:px-6">
                <span className="rounded-full bg-fei-sky/[0.10] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-fei-bg/58">
                  To: Head Coach
                </span>
                <span className="rounded-full bg-fei-bg/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-fei-bg/45">
                  Purpose: Staff debrief
                </span>
              </div>
            )}

            <div className={selectedRole === 'Assistant Coach' ? 'px-5 py-5 sm:px-6' : undefined}>
            <p
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'text-[10px] font-medium uppercase tracking-[0.07em] text-fei-bg/38'
                  : selectedRole === 'Assistant Coach'
                    ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-fei-bg/38'
                    : 'text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45'
              }
            >
              {selectedRole === 'Assistant Coach'
                ? 'Post-session staff debrief'
                : 'Situation'}
            </p>
            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/76 sm:text-base'
                  : selectedRole === 'Head Coach'
                    ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                    : selectedRole === 'Performance Analyst' ||
                        selectedRole === 'Physiotherapist'
                      ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                      : 'mt-5 text-base leading-8 text-fei-bg/70'
              }
            >
{selectedRole === 'Head Coach'
                ? 'Two hours before kick-off, your team faces an opponent that presses aggressively after backward passes and leaves space behind its fullbacks.'
                : selectedRole === 'Assistant Coach'
                  ? 'You have just finished a first-team training session. The unit work was effective at the start, but during the final repetitions the distance between midfield and defense increased, communication dropped, and players began reacting individually. The Head Coach has asked for a concise written debrief before the staff meeting.'
                  : selectedRole === 'Academy Director'
                    ? 'You need to send a short message to academy coaches about this year’s development standards. Explain that the academy will assess readiness, not only physical dominance or short-term match performance. Mention that the U16 group is strong, but standards must remain consistent.'
                    : selectedRole === 'Head of Scouting'
                      ? 'You need to write a short Q4 recruitment memo for leadership. Include priority profiles, strategic logic, and the next decision step.'
                      : selectedRole === 'Scout'
                        ? 'You need to write a short scout report recommendation for a technically strong player with inconsistent form. Include profile fit, risk, and next step.'
                        : selectedRole === 'Fitness Coach'
                          ? 'You are preparing a short update for the Head Coach before training. One player completed 90 minutes in the previous match. His recovery score is below his usual level, his legs feel heavy, and his recent high-speed running load is above his weekly average.'
                          : selectedRole === 'Performance Analyst'
                            ? 'You are preparing a short opposition note for the coaching staff. Across the last three matches, the opponent’s right fullback has moved very high during possession. When the ball is lost, the right center-back often has to defend wide, leaving more space between the center-backs.'
                            : selectedRole === 'Nutritionist'
                              ? 'You need to write a short match-day nutrition guide for a player. Include breakfast, pre-match fueling, hydration or electrolytes, half-time support and post-match recovery.'
                              : selectedRole === 'Physiotherapist'
                                ? 'During the second half of a match, a player lands awkwardly after challenging for the ball and immediately reports pain in his right ankle. He leaves the pitch and is assessed after the match. There is moderate swelling, reduced range of motion, and pain when putting weight on the foot. No final diagnosis has been confirmed yet.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'You need to write a short mental performance note for the coaching staff. The player is dealing with perfectionism, anxiety before matches and reduced confidence after mistakes.'
                                  : 'After training, you feel tightness in your left hamstring. It started during the second half of the session after a sharp turn while sprinting and increased slightly during the cool-down. You want to report it to the physiotherapist before the next session.'}
            </p>
            </div>
          </div>

          <div
            className={
              (selectedRole === 'Professional Player' ||
                selectedRole === 'Head Coach' ||
                selectedRole === 'Assistant Coach' ||
                selectedRole === 'Performance Analyst' ||
                selectedRole === 'Fitness Coach' ||
                selectedRole === 'Physiotherapist')
                ? 'mb-4'
                : 'mb-5'
            }
          >
            <p
              className={
                (selectedRole === 'Professional Player' ||
                  selectedRole === 'Head Coach' ||
                  selectedRole === 'Assistant Coach' ||
                  selectedRole === 'Performance Analyst' ||
                  selectedRole === 'Fitness Coach' ||
                  selectedRole === 'Physiotherapist')
                  ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                  : 'text-xl font-black leading-8 text-fei-bg'
              }
            >
              {selectedRole === 'Head Coach'
                ? 'Write a short pre-match message to the squad.'
                : selectedRole === 'Assistant Coach'
                  ? 'Write a 60–90-word debrief to the Head Coach.'
                  : selectedRole === 'Academy Director'
                    ? 'Write 3–5 sentences to academy coaches about development standards and player readiness.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Write 3–5 sentences for leadership with priority profiles, strategic logic, and next decision step.'
                      : selectedRole === 'Scout'
                        ? 'Write 3–5 sentences with player quality, profile fit, risk, and recommended next step.'
                        : selectedRole === 'Fitness Coach'
                          ? 'Write a 60–90-word message to the Head Coach.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Write a 60–90-word opposition analysis memo for the coaching staff.'
                            : selectedRole === 'Nutritionist'
                              ? 'Write 3–5 sentences with breakfast, pre-match fueling, hydration, half-time support and post-match recovery.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Write a 60–90-word medical update for the coaching and performance staff.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Write 3–5 sentences with the key issue, strategy and coaching support needed.'
                                  : 'Write a 30–80-word message to the physiotherapist describing the discomfort clearly and asking for an assessment.'}
            </p>

            {(selectedRole === 'Professional Player' ||
              selectedRole === 'Head Coach' ||
              selectedRole === 'Assistant Coach' ||
              selectedRole === 'Performance Analyst' ||
              selectedRole === 'Fitness Coach' ||
              selectedRole === 'Physiotherapist') ? (
              <>
                <p className="mt-3 text-sm font-medium leading-6 text-fei-bg/62">
                  Your response should:
                </p>

                {selectedRole === 'Professional Player' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">describe where and when the discomfort started;</li>
                    <li className="list-disc">explain what movement caused it and how it changed;</li>
                    <li className="list-disc">state clearly what support or assessment you need.</li>
                  </ul>
                ) : selectedRole === 'Head Coach' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">identify the main risk when playing through pressure;</li>
                    <li className="list-disc">give two clear tactical priorities;</li>
                    <li className="list-disc">state the communication and decision-making standard you expect.</li>
                  </ul>
                ) : selectedRole === 'Assistant Coach' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">identify what worked before the problem developed;</li>
                    <li className="list-disc">explain the main issue using observable evidence;</li>
                    <li className="list-disc">recommend one clear priority for the next session.</li>
                  </ul>
                ) : selectedRole === 'Performance Analyst' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">identify the recurring tactical pattern;</li>
                    <li className="list-disc">explain the vulnerability using the evidence provided;</li>
                    <li className="list-disc">recommend one clear way your team could exploit it.</li>
                  </ul>
                ) : selectedRole === 'Physiotherapist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">explain what happened during the match;</li>
                    <li className="list-disc">describe the player’s current symptoms;</li>
                    <li className="list-disc">summarize what the initial assessment shows;</li>
                    <li className="list-disc">state clearly what should happen next.</li>
                  </ul>
                ) : (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">summarize the player’s current physical status;</li>
                    <li className="list-disc">use the available evidence to explain your concern;</li>
                    <li className="list-disc">recommend one appropriate adjustment to today’s training load.</li>
                  </ul>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-fei-bg/52">
                Write 3–5 sentences in professional English.
              </p>
            )}
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder={
              selectedRole === 'Professional Player'
                ? 'Hi, I want to report some tightness in my left hamstring...'
                : selectedRole === 'Head Coach'
                  ? 'Today we need to stay composed when they press...'
                  : selectedRole === 'Assistant Coach'
                    ? 'The first part of the session was effective because...'
                    : selectedRole === 'Performance Analyst'
                      ? 'The opponent’s structure creates an opportunity when...'
                      : selectedRole === 'Fitness Coach'
                      ? 'The player’s current physical status suggests...'
                      : selectedRole === 'Physiotherapist'
                        ? 'During the second half, the player...'
                        : 'Hi, I wanted to report...'
            }
            rows={6}
            className={`mb-2 w-full resize-none bg-white text-base leading-7 text-fei-bg placeholder:text-fei-bg/25 focus:border-fei-sky focus:outline-none ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'rounded-xl border border-fei-bg/[0.12] px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)]'
                : 'rounded-2xl border border-fei-bg/15 px-5 py-4'
            }`}
          />
          <div className="mb-8 flex items-center justify-between text-xs text-fei-bg/45">
            <span>{wordCount} words</span>
            {selectedRole !== 'Professional Player' && (
              <span>
                {selectedRole === 'Head Coach'
                  ? 'Target: 70–100 words'
                  : selectedRole === 'Assistant Coach'
                    ? 'Target: 60–90 words'
                    : selectedRole === 'Fitness Coach'
                      ? 'Target: 60–90 words'
                      : selectedRole === 'Performance Analyst'
                        ? 'Target: 60–90 words'
                        : selectedRole === 'Physiotherapist'
                          ? 'Target: 60–90 words'
                          : 'Target: 30–80 words'}
              </span>
            )}
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
            </section>
          </div>
        </main>
      </div>
    )
  }

  // SPEAKING
  if (section === 'speaking') {
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

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-6 py-5 sm:px-8 lg:py-6">
          <ProgressBar current={getItemNumber('speaking', 0)} total={totalItems} />

          <div
            className={`grid items-start ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-7'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              <SectionBadge label="Speaking Production" />
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'min-w-0 max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                ? 'mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)] sm:px-6'
                : selectedRole === 'Assistant Coach'
                  ? 'mb-5 overflow-hidden rounded-2xl border border-fei-bg/[0.10] bg-white px-5 py-5 shadow-[0_4px_16px_rgba(15,23,42,0.035)] sm:px-6 sm:py-6'
                  : 'mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7'
            }
          >
            <p
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist')
                  ? 'text-[10px] font-medium uppercase tracking-[0.07em] text-fei-bg/38'
                  : 'text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45'
              }
            >
              {selectedRole === 'Assistant Coach'
                ? 'Live coaching intervention'
                : 'Situation'}
            </p>

            {selectedRole === 'Assistant Coach' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-fei-sky/[0.10] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-fei-bg/58">
                  Audience: Two players
                </span>

                <span className="rounded-full bg-fei-bg/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-fei-bg/45">
                  Time available: 45–60 seconds
                </span>
              </div>
            )}
            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/76 sm:text-base'
                  : selectedRole === 'Head Coach'
                    ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                    : selectedRole === 'Assistant Coach'
                      ? 'mt-4 max-w-[760px] text-[15px] leading-7 tracking-[-0.004em] text-fei-bg/72 sm:text-base'
                      : selectedRole === 'Performance Analyst' ||
                          selectedRole === 'Physiotherapist'
                        ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                        : 'mt-5 text-base leading-8 text-fei-bg/70'
              }
            >
{selectedRole === 'Head Coach'
                ? 'You substitute a senior player after 25 minutes because the opponent is repeatedly exploiting the space behind him. He reacts angrily near the technical area and says: “Why me? I wasn’t the only problem.”'
                : selectedRole === 'Assistant Coach'
                  ? 'During the final 11v11 block, the right winger presses the opposition fullback before the striker has blocked the pass into midfield. The central midfielder then holds his position, leaving an open route inside. The opposition plays through the pressure twice. The Head Coach asks you to stop the exercise and correct the two players before the restart.'
                  : selectedRole === 'Academy Director'
                    ? 'The Sporting Director wants to fast-track a U18 striker into the first team. You believe the player is not ready yet and that a second-team loan is the better pathway.'
                    : selectedRole === 'Head of Scouting'
                      ? 'The board prefers big-name signings, but your recruitment model prioritizes system fit, early identification, and sustainable value.'
                      : selectedRole === 'Scout'
                        ? 'You need to defend a recommendation to the Director of Recruitment. The player is technical, affordable now, and likely to become more expensive, but there are consistency concerns.'
                        : selectedRole === 'Fitness Coach'
                          ? 'You are speaking with a player after an evening match. He completed 90 minutes, recorded one of his highest high-speed running totals of the month, and performed several repeated sprint efforts during the final 20 minutes. He also returned from a hamstring injury three weeks ago and is still rebuilding his normal exposure to high-speed running. The team plays again in three days. Tomorrow is a recovery day, followed by one field session before the next match.'
                          : selectedRole === 'Performance Analyst'
                            ? 'During the staff meeting, the Head Coach says: “We had more of the ball in the second half, but we still struggled to create chances. What changed?” Your analysis shows that the team circulated possession deeper, received under more pressure in midfield, and completed fewer progressive actions into the final third.'
                            : selectedRole === 'Nutritionist'
                              ? 'You need to explain to a player why you are adjusting his fueling plan. He has been reporting fatigue late in matches, and his hydration and pre-training timing are inconsistent.'
                              : selectedRole === 'Physiotherapist'
                                ? 'A player is recovering from a knee injury. He has completed most of the rehabilitation process and has trained with the team twice. He is pain-free during normal football actions, but he still shows some loss of control during repeated high-speed changes of direction. The Head Coach wants to know if he can be available for an important match in three days.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'You need to explain to the head coach how to support a player whose perfectionism is creating pre-match anxiety and lower confidence after mistakes.'
                                  : 'After a difficult 2–1 defeat, a journalist asks you: “Some supporters are saying the team lacked commitment tonight. Do you agree?”'}
            </p>
          </div>

          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach')
                ? 'mb-4'
                : selectedRole === 'Assistant Coach'
                  ? 'mb-5'
                  : 'mb-8'
            }
          >
            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                  : selectedRole === 'Head Coach'
                    ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                    : selectedRole === 'Assistant Coach'
                      ? 'max-w-[720px] text-xl font-bold leading-8 tracking-[-0.015em] text-fei-bg sm:text-2xl'
                      : selectedRole === 'Performance Analyst' ||
                          selectedRole === 'Physiotherapist'
                        ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                        : 'text-xl font-black leading-8 text-fei-bg'
              }
            >
              {selectedRole === 'Head Coach'
                ? 'Respond to the player in a calm, clear and authoritative way.'
                : selectedRole === 'Assistant Coach'
                  ? 'Deliver a 45–60 second coaching intervention to the two players.'
                  : selectedRole === 'Academy Director'
                    ? 'Explain your position clearly and professionally, balancing first-team need with player development.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Defend your recruitment strategy clearly and professionally to the board.'
                      : selectedRole === 'Scout'
                        ? 'Defend your recommendation clearly, including tactical fit, value, timing, and risk.'
                        : selectedRole === 'Fitness Coach'
                          ? 'Give a 45–60 second explanation to the player about how he should manage the next two days.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Give a 45–60 second response to the Head Coach.'
                            : selectedRole === 'Nutritionist'
                              ? 'Explain the adjustment clearly, linking timing, hydration, energy and realistic behavior change.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Give a 45–60 second update to the Head Coach.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Explain the support strategy clearly, balancing confidence, standards, anxiety and sustainable performance.'
                                  : 'Record a 45–60 second response.'}
            </p>
            {(selectedRole === 'Professional Player' ||
              selectedRole === 'Head Coach' ||
              selectedRole === 'Assistant Coach' ||
              selectedRole === 'Performance Analyst' ||
              selectedRole === 'Fitness Coach' ||
              selectedRole === 'Physiotherapist') ? (
              <>
                <p className="mt-3 text-sm font-medium leading-6 text-fei-bg/62">
                  Your response should:
                </p>

                {selectedRole === 'Professional Player' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the result and the criticism;</li>
                    <li className="list-disc">protect the team without blaming teammates;</li>
                    <li className="list-disc">explain your view in a calm, professional media tone.</li>
                  </ul>
                ) : selectedRole === 'Head Coach' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the player’s frustration;</li>
                    <li className="list-disc">explain the tactical reason without blaming him;</li>
                    <li className="list-disc">maintain your authority while protecting the relationship.</li>
                  </ul>
                ) : selectedRole === 'Assistant Coach' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">identify the coordination problem between the two players;</li>
                    <li className="list-disc">clarify the pressing trigger and the supporting player’s responsibility;</li>
                    <li className="list-disc">finish with one clear instruction for the restart.</li>
                  </ul>
                ) : selectedRole === 'Performance Analyst' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">explain why more possession did not mean better attacking control;</li>
                    <li className="list-disc">use the evidence to identify what changed after halftime;</li>
                    <li className="list-disc">finish with one clear tactical point for the staff to review.</li>
                  </ul>
                ) : selectedRole === 'Physiotherapist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">explain what the player can currently do;</li>
                    <li className="list-disc">identify what is still limiting his return;</li>
                    <li className="list-disc">explain how you interpret the current risk;</li>
                    <li className="list-disc">recommend what should happen over the next three days;</li>
                    <li className="list-disc">state whether match availability can be confirmed yet.</li>
                  </ul>
                ) : (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">explain what the match demands mean for his recovery;</li>
                    <li className="list-disc">consider his recent return from injury when explaining the next training session;</li>
                    <li className="list-disc">clarify what may need to be adjusted compared with his normal training;</li>
                    <li className="list-disc">explain what should be monitored before the next match;</li>
                    <li className="list-disc">keep the message clear, practical and focused on readiness.</li>
                  </ul>
                )}

                <p className="mt-3 text-sm leading-6 text-fei-bg/52">
                  Recommended: 45–60 seconds · Maximum: 75 seconds
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-fei-bg/52">
                Recommended: 45–60 seconds · Maximum: 75 seconds
              </p>
            )}
          </div>

          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach')
                ? 'mb-4 rounded-xl border border-fei-bg/[0.09] bg-white p-4 sm:p-5'
                : selectedRole === 'Assistant Coach'
                  ? 'mb-5 rounded-2xl border border-fei-bg/[0.09] bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)] sm:p-5'
                  : ''
            }
          >
          {isRecording && (
            <div
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach')
                  ? 'mb-4'
                  : 'mb-6 rounded-2xl border border-red-500/25 bg-white p-5'
              }
            >
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

          <div className={(selectedRole === 'Professional Player' || selectedRole === 'Head Coach') ? 'mb-3' : 'mb-4'}>
            {!isRecording && !recordingDone && (
              <button
                onClick={startRecording}
                className={
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach')
                    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600'
                    : 'inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-red-500 px-8 py-3.5 font-bold text-white transition hover:bg-red-600'
                }
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
                className={
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach')
                    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-red-500 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/[0.05]'
                    : 'inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 bg-white px-8 py-3.5 font-bold text-red-600 transition hover:bg-red-500/[0.06]'
                }
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
            </section>
          </div>
        </main>
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
