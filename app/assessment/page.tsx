'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { ObjectiveItemEvidence } from '@/lib/diagnostic/types'
import { Suspense } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Section = 'intro' | 'audio-check' | 'warm-up' | 'reading' | 'listening' | 'vocabulary' | 'functional' | 'writing' | 'speaking' | 'pending'

type Answer = string | null

interface SubmissionReceipt {
  attemptId: string
  status: 'pending_evaluation' | 'human_review_required'
  message: string
}

// ─── ASSESSMENT DATA ───────────────────────────────────────────────────────────

const items = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: '',
      question: 'Which situation is most common in your role as a professional player?',
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
      context: '',
      question: 'What type of communication matters most to your daily professional performance?',
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
      context: 'Your physiotherapist sends this message:\n\n"Your recovery markers are acceptable, but your hamstring load is higher than normal. You can play, although a full match may affect your availability for midweek. We should manage your minutes and monitor intensity."',
      question: 'Which statement best reflects the balance between availability and risk?',
      options: [
        'A. You can play, but your workload should be controlled',
        'B. You should play normal minutes and reduce training later',
        'C. You should miss the match because injury is confirmed',
        'D. You are available without restrictions because recovery is acceptable',
      ],
      correct: 'A',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Role Expectations Under Review',
      context: 'Before a meeting, your agent forwards this message from the Sporting Director:\n\n"You remain an important part of the squad, but increased competition and recent availability issues mean your role may change. The club is not looking to move you on, although regular starts cannot be guaranteed. The next few weeks will influence what happens next."',
      question: 'What is the Sporting Director implying about the player\'s situation?',
      options: [
        'A. The club has already decided to sell him',
        'B. He is still valued, but his role is becoming less secure',
        'C. Injuries are the only reason he is not starting regularly',
        'D. His reduced role has already been fixed for the season',
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
      context: '',
      question: 'Which responsibility is most typical for a Head Coach?',
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
      context: '',
      question: 'What would a Head Coach typically need to communicate to players and staff?',
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
        'A. Keep the player out of the starting lineup',
        'B. Start him but limit his total match time',
        'C. Let him complete the match and recover later',
        'D. Use him only during the final part of the game',
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
        'A. Change the tactical approach after the defeat',
        'B. Focus on the positives and ignore the error',
        'C. Treat the individual mistake as the main problem',
        'D. Correct the mistake without losing perspective',
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
        'A. The club should acknowledge publicly that the plan is failing',
        'B. The team should make a major tactical change immediately',
        'C. The public message can stay calm while the approach is reviewed internally',
        'D. External criticism is creating a bigger problem than the performances',
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
        'The coach says: “The back line and midfield need compactness when we defend.”',
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
      context: '',
      question: 'Which situation is most likely to be part of your daily work as an Assistant Coach?',
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
      context: '',
      question: 'What is the most appropriate communication priority for an Assistant Coach?',
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
      question: 'What should the Assistant Coach do?',
      options: [
        'A. Keep the original routine and avoid changing the plan.',
        'B. Focus only on protecting against the counterattack.',
        'C. Adjust the routine to exploit the new setup and protect transition.',
        'D. Ask the Head Coach to redesign the set-piece plan.',
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
        'A. Replace the corner routine with a different setup',
        'B. Delay one movement while keeping the structure intact',
        'C. Add another runner to overload the penalty area',
        'D. Remove the blocker from the first attacking movement',
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
      level: 'Warm-Up',
      label: 'Item 1 — Academy Leadership',
      context: '',
      question: 'Which task is a core responsibility of an Academy Director?',
      options: [
        'A. Preparing opposition reports for senior match staff.',
        'B. Coordinating rehabilitation plans with the medical team.',
        'C. Negotiating professional contracts with player representatives.',
        'D. Aligning academy coaches around player-development standards.',
      ],
      correct: 'D',
    },
    {
      id: 'w2',
      level: 'Warm-Up',
      label: 'Item 2 — Development Pathway',
      context: '',
      question: 'What would an Academy Director typically coordinate across the club?',
      options: [
        'A. Match-day media interviews and press duties.',
        'B. Player development pathways between age groups and senior football.',
        'C. Individual nutrition plans for first-team players.',
        'D. Daily physical-load targets for injured players.',
      ],
      correct: 'B',
    },
  ],

  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Player Progression',
      context:
        'Academy update:\n\nThree U17 players will train with the U19 group next month. They will still play most of their matches with the U17 team.',
      question: 'What is changing for these three players?',
      options: [
        'A. They are leaving the U17 squad completely.',
        'B. They are starting some training at a higher age group.',
        'C. They are moving permanently into first-team football.',
        'D. They are stopping matches to focus only on training.',
      ],
      correct: 'B',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Development Review',
      context:
        'Coach report:\n\nThe midfielder is technically strong and usually understands the tactical work well. However, when sessions become more demanding, he sometimes loses concentration and reacts negatively to feedback. Before we consider moving him to the next age group, we need to see more consistency in these situations.',
      question: 'Why is the player not ready to progress yet?',
      options: [
        'A. His technical level is below the required standard.',
        'B. He needs to become more consistent when challenged.',
        'C. His tactical understanding is still too limited.',
        'D. He has not played enough matches this season.',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Managing Early Promotion',
      context:
        'Pathway review:\n\nA U18 striker has impressed the first-team staff. Although his technical level has improved, academy coaches remain concerned about how he responds to setbacks and pressure. They are considering occasional senior training while he continues playing regularly at youth level.',
      question: 'What is the main purpose of this approach?',
      options: [
        'A. To delay his progression until his technical level improves further.',
        'B. To expose him to senior demands without removing developmental stability.',
        'C. To reduce the academy’s responsibility for his future performance.',
        'D. To prepare him for a permanent move away from youth football.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Competing Pathway Priorities',
      context:
        'Academy review:\n\nTwo U19 players could help cover first-team shortages. Senior staff want faster integration, but neither player has consistently met the club’s readiness standards. Limited senior exposure may support development, whereas permanent promotion could allow a short-term staffing problem to dictate a long-term pathway decision.',
      question: 'Which approach best reconciles the competing priorities?',
      options: [
        'A. Promote both players because first-team shortages require immediate solutions.',
        'B. Keep both players entirely in the academy until every criterion is satisfied.',
        'C. Use controlled senior exposure while preserving the standards for permanent progression.',
        'D. Transfer the decision entirely to first-team staff because the need originates there.',
      ],
      correct: 'C',
    },
  ],

  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Academy Staffing Update',
      script:
        'The U15 group needs a new goalkeeper coach. The U16 staff is complete, and the U18 group does not need any changes this month.',
      question: 'Which group needs a new coach?',
      options: [
        'A. The U18 group.',
        'B. The U16 group.',
        'C. The U15 group.',
        'D. The first team.',
      ],
      correct: 'C',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Recruitment Profile Change',
      script:
        'Our first team is asking for midfielders who can play in more than one role. Because of that, we need to adjust the profile we use when recruiting for the next academy intake.',
      question: 'Why should the academy change its recruitment profile?',
      options: [
        'A. Because the first team wants more adaptable midfielders.',
        'B. Because the academy has too many midfielders already.',
        'C. Because the current age groups need fewer players.',
        'D. Because the club wants to reduce recruitment activity.',
      ],
      correct: 'A',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Parent Expectation Management',
      script:
        'The player is physically ahead of most of his age group, and his family believes that should lead to immediate promotion. However, our assessment also includes decision-making, consistency and response to pressure. Moving him too early could hide areas that still need development.',
      question: 'What is the Academy Director’s main concern?',
      options: [
        'A. Physical development is progressing too quickly.',
        'B. Promotion may happen before overall readiness is established.',
        'C. The family should have less involvement in academy decisions.',
        'D. The player needs more competitive minutes at his current level.',
      ],
      correct: 'B',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Protecting the Development Model',
      script:
        'There is increasing pressure to promote two U19 players because the first team is short of options. Both have shown potential, but neither has consistently met the full readiness criteria. We can increase their exposure to senior training, but permanent promotion should not become a solution to a short-term squad problem.',
      question: 'What principle is guiding the Academy Director’s position?',
      options: [
        'A. First-team shortages should determine academy promotion timing.',
        'B. Senior exposure should replace formal readiness assessment.',
        'C. Development decisions should remain evidence-based despite immediate pressure.',
        'D. U19 players should avoid first-team involvement until they are fully established.',
      ],
      correct: 'C',
    },
  ],

  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Development Plan',
      context: 'The Academy Director says: “Each player has a development plan for the season.”',
      question: 'What does development plan mean here?',
      options: [
        'A. A record of matches played this season.',
        'B. A plan for how the player should improve.',
        'C. A schedule for senior-team training sessions.',
        'D. A report used to review contract decisions.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Readiness Criteria',
      context: 'The academy report says: “The player meets most of the readiness criteria, but consistency is still a concern.”',
      question: 'What does readiness criteria mean?',
      options: [
        'A. Tests used to compare players in one age group.',
        'B. Targets used to plan training across the season.',
        'C. Standards used to decide if a player can progress.',
        'D. Rules used to decide who receives a new contract.',
      ],
      correct: 'C',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Transitional Exposure',
      context: 'The pathway review says: “We recommend transitional exposure to senior football rather than immediate permanent promotion.”',
      question: 'What does transitional exposure mean here?',
      options: [
        'A. Regular movement between different academy teams.',
        'B. Limited senior involvement before full promotion.',
        'C. Reduced match minutes during a review period.',
        'D. Permanent promotion after senior observation.',
      ],
      correct: 'B',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Developmental Trade-Off',
      context: 'The Academy Director says: “Accelerating promotion may create a developmental trade-off.”',
      question: 'What does developmental trade-off imply here?',
      options: [
        'A. Delaying a decision until staff reach agreement.',
        'B. Comparing two pathways with similar outcomes.',
        'C. Gaining one benefit while giving up another.',
        'D. Moving resources between different age groups.',
      ],
      correct: 'C',
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
      label: 'Item 1 — Recruitment Strategy',
      context: '',
      question: 'Which responsibility is central to a Head of Recruitment?',
      options: [
        'A. Designing individual rehabilitation programs for injured players.',
        'B. Coordinating recruitment priorities and leading the scouting process.',
        'C. Delivering tactical sessions to the first-team squad.',
        'D. Managing match-day media interviews for players.',
      ],
      correct: 'B',
    },
    {
      id: 'w2',
      label: 'Item 2 — Leadership Communication',
      context: '',
      question: 'What would a Head of Recruitment typically need to communicate?',
      options: [
        'A. Recruitment priorities, evidence and recommendations for decision-makers.',
        'B. Detailed rehabilitation progressions for injured players.',
        'C. Daily technical instructions for each position during training.',
        'D. Individual nutrition targets for players during congested periods.',
      ],
      correct: 'A',
    },
  ],

  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Recruitment Priorities',
      context:
        'The club needs a new right-back and a defensive midfielder. The Head Coach says the right-back is more urgent because the current starter is injured. The recruitment team will focus on that position first.',
      question: 'Which position is the current priority?',
      options: [
        'A. Defensive midfielder.',
        'B. Center-back.',
        'C. Right-back.',
        'D. Striker.',
      ],
      correct: 'C',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Coordinating the Scouting Team',
      context:
        'The recruitment department is monitoring several center-backs. Two scouts have already watched the same players in France, while no one has covered the club’s targets in Belgium. Because the next decision meeting is in three weeks, the Head of Recruitment changes the scouting schedule to improve coverage.',
      question: 'Why does the Head of Recruitment change the scouting schedule?',
      options: [
        'A. To avoid unnecessary duplication and collect evidence from another market.',
        'B. To stop scouting center-backs until the next transfer window.',
        'C. To allow the scouts in France to make the final recruitment decision.',
        'D. To reduce the number of players discussed at the next meeting.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Recruitment Prioritization',
      context:
        'Recruitment planning note:\n\n“The coaching staff have requested an experienced striker who can contribute immediately. However, the club also needs to prepare for the likely departure of a starting midfielder next summer. The available budget would make two major signings difficult in the same window. Although the striker represents the more immediate sporting need, delaying the midfield search could significantly reduce the club’s options later.”',
      question: 'What is the main challenge for the Head of Recruitment?',
      options: [
        'A. Determining whether the coaching staff have identified the correct striker profile.',
        'B. Balancing an immediate squad need against a foreseeable future requirement.',
        'C. Deciding which scouts should be responsible for monitoring midfielders.',
        'D. Establishing whether the club should increase its transfer budget.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Conflicting Recruitment Evidence',
      context:
        'Recruitment review:\n\n“Live scouting favors an experienced candidate with a strong record. The data team prefers a younger option with better long-term indicators, while the coaching staff support a third profile that appears more compatible with the playing model. Each recommendation is credible, but none addresses all of the club’s priorities.”',
      question: 'What is the Head of Recruitment primarily required to do?',
      options: [
        'A. Decide which department should have greater influence over recruitment.',
        'B. Choose the option with the lowest level of uncertainty.',
        'C. Integrate different perspectives into one strategic decision.',
        'D. Wait until one candidate becomes clearly preferable.',
      ],
      correct: 'C',
    },
  ],

  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Recruitment Update',
      script:
        'We have two priority positions for this window: right-back and striker. The right-back search is more advanced because three players are already being monitored. We still need more options for the striker position.',
      question: 'Which search is currently more advanced?',
      options: [
        'A. Striker.',
        'B. Right-back.',
        'C. Center-back.',
        'D. Goalkeeper.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Reallocating Scouting Coverage',
      script:
        'Our scouts in Spain have already produced several reports on left-backs, but we still have very little information from Portugal. Since the club wants a wider comparison before making a decision, I’m moving one scout to Portugal for the next two weeks.',
      question: 'Why is the Head of Recruitment changing the scouting coverage?',
      options: [
        'A. To stop monitoring left-backs in Spain.',
        'B. To reduce the number of reports being produced.',
        'C. To broaden the evidence available before a decision.',
        'D. To give the Portuguese scout responsibility for the final choice.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Managing Recruitment Priorities',
      script:
        'The coaching staff want an experienced center-forward who can contribute immediately. At the same time, our squad planning shows that we may need a starting left-back next summer. We cannot fully resource both searches at the same level, so I want the recruitment team to maintain the striker as the immediate priority while continuing targeted work on the left-back market.',
      question: 'What approach is the Head of Recruitment recommending?',
      options: [
        'A. Focus exclusively on the striker and pause all other work.',
        'B. Prioritize the urgent need while keeping another future requirement active.',
        'C. Move the left-back search ahead of the striker search.',
        'D. Ask the coaching staff to choose which position should be monitored.',
      ],
      correct: 'B',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Challenging a Recruitment Recommendation',
      script:
        'The scouting team strongly favors one candidate, but most of the reports come from similar match contexts and reach largely the same conclusion. Before we progress the recommendation, I want to know whether we have tested the assumptions behind it. We need evidence from different environments, not simply more reports that confirm what we already believe.',
      question: 'What is the Head of Recruitment mainly concerned about?',
      options: [
        'A. The number of scouts involved in the process.',
        'B. The possibility that the assessment has become too expensive.',
        'C. The risk that the recommendation is based on insufficiently varied evidence.',
        'D. The lack of agreement between the scouting and coaching departments.',
      ],
      correct: 'C',
    },
  ],

  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Recruitment Brief',
      context:
        'The Head of Recruitment says: “Before the scouts travel, I want everyone working from the same recruitment brief.”',
      question: 'What is a recruitment brief?',
      options: [
        'A. A short description of the player profile the club needs.',
        'B. A medical summary prepared before a possible signing.',
        'C. A schedule showing where scouts will watch matches.',
        'D. A document outlining the main terms of a contract.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Scouting Coverage',
      context:
        'The department review says: “Our scouting coverage in this market is still limited.”',
      question: 'What does scouting coverage refer to?',
      options: [
        'A. How many players are registered in that competition.',
        'B. How well a market is being monitored by scouts.',
        'C. How many matches are available on video platforms.',
        'D. How much budget is assigned to that region.',
      ],
      correct: 'B',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Succession Planning',
      context:
        'The Head of Recruitment explains: “This search is part of our succession planning, not an immediate replacement.”',
      question: 'What does succession planning mean here?',
      options: [
        'A. Preparing early for future changes in key squad roles.',
        'B. Replacing experienced scouts when their contracts end.',
        'C. Promoting academy players when senior players are unavailable.',
        'D. Ranking transfer targets according to their expected cost.',
      ],
      correct: 'A',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Due Diligence',
      context:
        'The recruitment meeting concludes: “The sporting case is strong, but the due diligence is not complete.”',
      question: 'What does due diligence mean in this situation?',
      options: [
        'A. A final tactical review before approving the player.',
        'B. Verifying key information before making a recruitment decision.',
        'C. Negotiating with the selling club to reduce the fee.',
        'D. Comparing current performance with future development potential.',
      ],
      correct: 'B',
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
      label: 'Item 1 — Player Evaluation',
      context: 'You are completing the FEI diagnostic for the Scout role.',
      question: 'Which task is a core responsibility of a Scout?',
      options: [
        'A. Planning rehabilitation schedules for injured players.',
        'B. Leading tactical sessions with squad players.',
        'C. Observing players and producing evidence-based evaluations.',
        'D. Negotiating contractual terms with player representatives.',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Recruitment Communication',
      context: 'The diagnostic personalizes the pathway around the communication demands of your scouting role.',
      question: 'What would a Scout typically communicate to the recruitment department?',
      options: [
        'A. A player’s suitability for a defined recruitment profile.',
        'B. The squad’s weekly physical-load targets.',
        'C. The medical plan for returning an injured player.',
        'D. Tactical instructions for an upcoming match.',
      ],
      correct: 'A',
    },
  ],

  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Wide Player Observation',
      context:
        'Scout note:\n\n“The winger is quick and comfortable with the ball. He makes good runs behind the fullback, but he does not always press after losing possession.”',
      question: 'Which part of the player’s game needs improvement?',
      options: [
        'A. His ability to run with the ball.',
        'B. His movement behind the defense.',
        'C. His pressing after possession is lost.',
        'D. His speed when attacking wide areas.',
      ],
      correct: 'C',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Monitoring Progress',
      context:
        'Scouting update:\n\n“The scout has watched the midfielder several times this season. Although his passing range has improved, he still loses possession when he is pressed aggressively. Because the club needs a player who can receive under pressure, another observation has been recommended.”',
      question: 'Why has another observation been recommended?',
      options: [
        'A. The scout wants to confirm how the player performs under pressure.',
        'B. The club has already decided to recruit the midfielder.',
        'C. The player needs to improve his long-range shooting.',
        'D. The scout believes his passing has become less effective.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Role Fit',
      context:
        'Recruitment assessment:\n\n“The striker has scored consistently, yet much of his output comes from attacking space in transition. The club, by contrast, is assessing a profile that can also combine effectively against compact defensive blocks. Although his production is impressive, the evidence does not yet confirm that his strengths transfer naturally to the required role.”',
      question: 'What is the Scout’s main reservation?',
      options: [
        'A. His scoring record is based on too few appearances.',
        'B. His strongest qualities may not fully match the required profile.',
        'C. He is unlikely to perform against physically stronger defenders.',
        'D. His attacking contribution depends mainly on individual technique.',
      ],
      correct: 'B',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Recruitment Projection',
      context:
        'Scouting assessment:\n\n“The center-back has excelled in a dominant side whose defensive structure rarely leaves him exposed. While his positioning and distribution appear assured, the extent to which he can manage sustained exposure in large spaces has yet to be established. Given that the target profile requires aggressive positioning with minimal cover, his suitability cannot be inferred solely from current output.”',
      question: 'Which conclusion is best supported by the report?',
      options: [
        'A. His current output provides sufficient evidence to overlook uncertainty about tactical adaptation.',
        'B. His distribution indicates that he should transfer comfortably to a more demanding defensive structure.',
        'C. Further evidence is required before concluding that his performance will translate to the intended role.',
        'D. His experience in a dominant side makes him inherently unsuitable for a more exposed defensive model.',
      ],
      correct: 'C',
    },
  ],

  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Basic Player Profile',
      script:
        'The player is 22 and usually plays on the right wing. He is quick, comfortable with the ball and works hard when the team loses possession. His crossing is less consistent.',
      question: 'Which area is identified as less consistent?',
      options: [
        'A. His speed.',
        'B. His crossing.',
        'C. His work rate.',
        'D. His ball control.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Comparing Two Profiles',
      script:
        'Player A is more experienced and stronger physically, but Player B is quicker and more comfortable receiving between the lines. Because the target role requires mobility and combination play, I would continue monitoring Player B.',
      question: 'Why does the Scout prefer to continue monitoring Player B?',
      options: [
        'A. He has more professional experience.',
        'B. He is physically stronger.',
        'C. His qualities fit the target role better.',
        'D. He has already been approved for recruitment.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Form or Sustainable Improvement?',
      script:
        'The forward’s numbers have improved considerably this season, yet the increase in goals does not tell us whether his overall game has developed. I would compare his decision-making, movement and chance quality across several matches before treating the current output as evidence of sustainable progression.',
      question: 'What does the Scout want to establish?',
      options: [
        'A. Whether the player’s improvement extends beyond his recent goal total.',
        'B. Whether the player should immediately move to a stronger league.',
        'C. Whether his finishing numbers are higher than those of other forwards.',
        'D. Whether the current season should be considered separately from previous ones.',
      ],
      correct: 'A',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Evaluating Contextual Risk',
      script:
        'The midfielder has been highly effective in a possession-dominant team, where he usually receives under controlled conditions. What remains uncertain is whether his decision-making would hold up in a more transitional environment with less time and space. Before endorsing the profile, I would want evidence that his effectiveness is not overly dependent on the current tactical context.',
      question: 'What is the Scout’s main concern?',
      options: [
        'A. His current team gives him too few opportunities to influence possession.',
        'B. His effectiveness may not transfer reliably to a different tactical environment.',
        'C. His decision-making is already inadequate under pressure.',
        'D. His technical quality is less important than his physical profile.',
      ],
      correct: 'B',
    },
  ],

  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Shortlist',
      context:
        'The Scout says: “I added the player to the shortlist after the second observation.”',
      question: 'What does shortlist mean here?',
      options: [
        'A. A final contract offered to the player.',
        'B. A small group of players still being considered.',
        'C. A list of matches selected for live scouting.',
        'D. A report sent directly to the coaching staff.',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Role Fit',
      context:
        'The recruitment report says: “The player has quality, but his role fit is still unclear.”',
      question: 'What does role fit mean here?',
      options: [
        'A. How well the player matches the demands of the position.',
        'B. Whether the player is physically stronger than teammates.',
        'C. How quickly the player can move between age groups.',
        'D. Whether the club can complete the transfer immediately.',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Ceiling',
      context:
        'The Scout explains: “His current level is strong, but we are still uncertain about his ceiling.”',
      question: 'What does ceiling mean here?',
      options: [
        'A. The highest level the player may realistically be capable of reaching.',
        'B. The minimum performance standard required for recruitment.',
        'C. The financial limit the club has set for the transfer.',
        'D. The point at which the scouting process must be completed.',
      ],
      correct: 'A',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Validity',
      context:
        'The scouting review states: “His recent performances are impressive, but the validity of that evidence is still uncertain.”',
      question: 'What does validity refer to here?',
      options: [
        'A. Whether the evidence genuinely supports the recruitment conclusion.',
        'B. Whether the player is physically ready for a higher workload.',
        'C. Whether the club can register him during the current window.',
        'D. Whether his tactical role remains unchanged across matches.',
      ],
      correct: 'A',
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
        'Training update:\n\nToday’s session was shorter than usual. The players completed fewer high-speed runs and had more recovery time between drills.',
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
        'Player readiness report:\n\nBefore training, one player reports heavy legs after the previous match. His wellness score is lower than normal, and his recent running load is above his weekly average.',
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
        'Match load comparison:\n\nThe team covered a similar total distance in both matches. However, in the second match, high-speed running increased significantly and repeated sprint efforts were more frequent.',
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
        'Performance monitoring report:\n\nOver the last three weeks, the player’s total training volume has remained relatively stable. However, his high-intensity exposure has increased, recovery scores have gradually declined, and his sprint output in training has started to fall.',
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
      level: 'Warm-Up',
      label: 'Item 1 — Performance Nutrition',
      context: '',
      question: 'Which task is a core responsibility of a Nutritionist?',
      options: [
        'A. Planning player fueling and recovery strategies.',
        'B. Designing opposition pressing structures.',
        'C. Managing injury rehabilitation timelines.',
        'D. Leading contract negotiations.',
      ],
      correct: 'A',
    },
    {
      id: 'w2',
      level: 'Warm-Up',
      label: 'Item 2 — Player Support',
      context: '',
      question: 'What would a Nutritionist typically discuss with a player?',
      options: [
        'A. Recruitment priorities for the next window.',
        'B. Fueling, hydration and recovery habits.',
        'C. Defensive organization before the match.',
        'D. Contract clauses and salary structure.',
      ],
      correct: 'B',
    },
  ],

  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Recovery After Training',
      context:
        'Recovery note:\n\n“Training finishes at 12:00. After the session, the player should have a meal with carbohydrates and protein. He should also drink water during the afternoon.”',
      question: 'What should the player do after training?',
      options: [
        'A. Wait until the evening before eating.',
        'B. Eat a recovery meal and keep drinking fluids.',
        'C. Drink only water and avoid carbohydrates.',
        'D. Have another meal before training.',
      ],
      correct: 'B',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Match-Day Hydration',
      context:
        'Match-day hydration plan:\n\n“The player arrives at the stadium slightly below his usual body mass. Although he drinks regularly before kick-off, the staff compare his body mass before and after the match so they can estimate how much fluid he needs to replace.”',
      question: 'Why do the staff compare the player’s body mass before and after the match?',
      options: [
        'A. To estimate how much fluid needs to be replaced.',
        'B. To check whether his pre-match meal was large enough.',
        'C. To decide whether he should reduce carbohydrate intake.',
        'D. To measure how much energy he used during the match.',
      ],
      correct: 'A',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Pre-Match Gastrointestinal Discomfort',
      context:
        '\n\n“The player repeatedly reports abdominal discomfort during warm-ups before evening fixtures. Although his hydration status is normal, he usually eats a large meal high in fat and fiber shortly before travelling to the stadium. By contrast, symptoms are uncommon after morning sessions, when meals are lighter and consumed earlier.”',
      question: 'Which factor is most likely contributing to the player’s symptoms?',
      options: [
        'A. His total fluid intake throughout the training week.',
        'B. The intensity of the warm-up before kick-off.',
        'C. The composition and timing of his pre-match meal.',
        'D. His carbohydrate intake after morning sessions.',
      ],
      correct: 'C',
    },
    {
      id: 'r4',
      level: 'C1',
      label: 'Item 6 — Energy Availability During Fixture Congestion',
      context:
        'Performance nutrition review:\n\n“During a congested fixture period, the midfielder is losing body mass. Late kick-offs reduce his appetite, while large post-match meals disrupt sleep. Smaller meals earlier are better tolerated, but staff are concerned about unnecessary weight gain. The current pattern may compromise recovery.”',
      question: 'Which intervention best balances fueling and recovery?',
      options: [
        'A. Maintain his current intake and monitor performance.',
        'B. Add most of the extra energy after matches.',
        'C. Spread extra energy across tolerated meals and snacks.',
        'D. Increase his main meals and avoid additional snacks.',
      ],
      correct: 'C',
    },
  ],

  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 7 — Pre-Training Fueling',
      script:
        'Training starts at ten. The player should eat breakfast at seven and have a small carbohydrate snack before the session. He should also drink water before training.',
      question: 'What should the player do before training?',
      options: [
        'A. Skip breakfast and eat after the session.',
        'B. Eat breakfast, have a snack and drink water.',
        'C. Eat only protein before training.',
        'D. Wait until training starts to drink.',
      ],
      correct: 'B',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 8 — Second-Half Energy',
      script:
        'The player has been losing energy during the second half of matches. His breakfast is early, and although he eats a pre-match meal, there is a long gap before kick-off. We should add a carbohydrate snack closer to the match so that he has more energy available when the game starts.',
      question: 'Why is the nutritionist recommending another snack?',
      options: [
        'A. Because the player needs more protein after breakfast.',
        'B. Because his pre-match hydration has been too high.',
        'C. Because the long gap may reduce available energy.',
        'D. Because his recovery meal is too close to kick-off.',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 9 — Nutrition During Ramadan',
      script:
        'The player is observing Ramadan and will therefore be fasting during daylight hours. Rather than trying to maintain his usual routine, we need to adjust both fueling and hydration around the periods when he is able to eat and drink. The pre-dawn meal should provide sustained energy, while the period after sunset gives us an opportunity to restore fluids and support recovery. Training demands will also need to be considered when we plan these windows.',
      question: 'What principle is guiding the nutritionist’s approach?',
      options: [
        'A. Maintaining the normal routine despite restricted eating hours.',
        'B. Reducing training until the fasting period has finished.',
        'C. Prioritizing hydration while leaving fueling unchanged.',
        'D. Adapting intake around available eating and drinking windows.',
      ],
      correct: 'D',
    },
    {
      id: 'l4',
      level: 'C1',
      label: 'Item 10 — Recovery Under Conflicting Constraints',
      script:
        'The player’s recovery intake has become increasingly inconsistent during this congested run of fixtures. He understands the nutritional targets, but his appetite is markedly reduced after late matches, and forcing larger meals has started to interfere with sleep. Simply increasing portion sizes is therefore unlikely to solve the problem. I would rather redistribute some of the required energy earlier in the day and use smaller, more tolerable recovery options afterwards. That should help us maintain adequate energy availability without creating an additional barrier to sleep and recovery.',
      question: 'What is the nutritionist’s underlying rationale?',
      options: [
        'A. Post-match intake should be reduced whenever sleep quality declines.',
        'B. Recovery targets should be met through a strategy the player can tolerate consistently.',
        'C. Energy intake before matches should replace the need for post-match recovery.',
        'D. Appetite should determine whether recovery nutrition is necessary.',
      ],
      correct: 'B',
    },
  ],

  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 11 — Recovery Meal',
      context: 'The Nutritionist says: “Have a recovery meal after training.”',
      question: 'What does recovery meal mean?',
      options: [
        'A. A meal eaten after exercise to help the body recover.',
        'B. A meal eaten before training to avoid feeling hungry.',
        'C. A small snack eaten only during a match.',
        'D. A meal used to reduce body weight.',
      ],
      correct: 'A',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 12 — Nutrient Timing',
      context: 'The Nutritionist explains: “Nutrient timing is especially important on double-session days.”',
      question: 'What does nutrient timing mean?',
      options: [
        'A. Adjusting when nutrients are consumed around training demands.',
        'B. Recording the total number of calories eaten each week.',
        'C. Choosing meals according to the player’s preferred foods.',
        'D. Reducing portion sizes when training volume increases.',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 13 — Carbohydrate Periodization',
      context: 'The Nutritionist explains: “We are using carbohydrate periodization rather than prescribing the same intake for every training day.”',
      question: 'What does carbohydrate periodization mean in this context?',
      options: [
        'A. Adjusting carbohydrate intake according to the demands and purpose of different sessions.',
        'B. Increasing carbohydrate intake progressively throughout each training session.',
        'C. Replacing some carbohydrate sources when gastrointestinal symptoms occur.',
        'D. Distributing the same carbohydrate target more evenly across the training week.',
      ],
      correct: 'A',
    },
    {
      id: 'v4',
      level: 'C1',
      label: 'Item 14 — Energy Compensation',
      context: 'The Nutritionist says: “The player shows limited energy compensation on high-load days despite increasing his intake after training.”',
      question: 'What does limited energy compensation imply in this context?',
      options: [
        'A. His additional intake is not fully offsetting the increase in energy expenditure.',
        'B. His post-training intake is restoring energy stores more slowly than expected.',
        'C. His total intake is sufficient, but its distribution around training is inappropriate.',
        'D. His increased intake is producing more energy than the current workload requires.',
      ],
      correct: 'A',
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
        'The player continues to report knee discomfort, although imaging does not fully explain the symptoms. During rehabilitation, he moves more cautiously when he expects pain and says he is worried about damaging the knee again. The medical team plans to continue physical rehabilitation while also addressing confidence.',
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
        'The player has completed two full training sessions without pain and reports high confidence. Strength testing is close to his pre-injury level. However, during repeated high-speed actions, his output decreases more than expected and movement quality begins to change. The coaching staff would like him available for the next match.',
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
      context: '“Before important matches, the player becomes tense and starts thinking about possible mistakes. His breathing becomes faster and he finds it harder to focus on his normal routine. The psychologist wants to introduce a simple breathing strategy and a more realistic way of thinking about mistakes.”',
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
      context: '“The player has met the main physical return criteria and completed two full team sessions without pain. However, during high-intensity drills that resemble the mechanism of his previous injury, he becomes hesitant, reduces his speed before contact and reports anticipating another setback. Since no new physical restriction has been identified, his response may reflect a psychological barrier rather than a physical limitation.”',
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
      context: '“A senior player says external criticism and family pressure are affecting his concentration and emotional control, but asks that the personal details remain confidential. The Head Coach has noticed changes in his behavior and wants to know whether communication or match preparation should be adjusted. The psychologist must protect sensitive information while still providing useful performance guidance.”',
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
      context: 'A player asks: “I’m frustrated because I keep making the same mistakes.”',
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
      context: 'A player asks: “Everything feels too much right now. I’m overwhelmed.”',
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
      context: 'The coach says: “After several poor performances, the player is showing more self-doubt.”',
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
      context: 'The coach says: “The player appears composed in front of staff, but privately describes persistent anger and anxiety. He is increasingly suppressing these reactions rather than processing them, and this seems to be affecting his concentration during matches.”',
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

function DiagnosticProgressSidebar({
  currentItem,
  states,
}: {
  currentItem: number
  states: Record<number, 'completed' | 'skipped' | 'pending'>
}) {
  const sections = [
    { label: 'Warm-Up', start: 1, end: 2 },
    { label: 'Reading', start: 3, end: 6 },
    { label: 'Listening', start: 7, end: 10 },
    { label: 'Vocabulary', start: 11, end: 14 },
    { label: 'Writing', start: 15, end: 15 },
    { label: 'Speaking', start: 16, end: 16 },
  ]

  return (
    <div className="w-full max-w-[150px]">
      <div className="space-y-2">
        {sections.map((progressSection) => {
          const sectionIsActive =
            currentItem >= progressSection.start &&
            currentItem <= progressSection.end

          const sectionIsPast = currentItem > progressSection.end

          return (
            <div
              key={progressSection.label}
              className={`flex min-h-8 items-center gap-2.5 rounded-lg px-2 py-1.5 transition ${
                sectionIsActive
                  ? 'bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]'
                  : ''
              }`}
            >
              <div className="flex w-4 shrink-0 justify-center">
                {sectionIsActive ? (
                  null
                ) : sectionIsPast ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-fei-sky/[0.14] text-[9px] font-black text-fei-bg/60">
                    ✓
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-fei-bg/15" />
                )}
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-[0.13em] transition ${
                  sectionIsActive
                    ? 'text-fei-bg/90'
                    : sectionIsPast
                      ? 'text-fei-bg/50'
                      : 'text-fei-bg/28'
                }`}
              >
                {progressSection.label}
              </span>
            </div>
          )
        })}
      </div>
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

function UnansweredModal({
  onStay,
  onContinue,
}: {
  onStay: () => void
  onContinue: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onStay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onStay])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-fei-bg/35 px-5 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unanswered-dialog-title"
      onClick={onStay}
    >
      <div
        className="relative w-full max-w-[430px] overflow-hidden rounded-[1.5rem] border border-fei-bg/[0.12] bg-white p-5 shadow-[0_28px_80px_rgba(7,17,31,0.22)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent" />

        <div className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2 opacity-[0.045]">
          <img
            src="/fei-logo-navbar-vector.svg"
            alt=""
            aria-hidden
            className="h-[185px] w-auto"
          />
        </div>

        <div className="relative z-10">
          <h2
            id="unanswered-dialog-title"
            className="whitespace-nowrap text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-fei-bg/95 sm:text-[20px]"
          >
            Continue without answering?
          </h2>

          <p className="mt-1.5 text-[11px] font-normal leading-4 text-fei-bg/40 sm:text-xs">
            You won't be able to return to this question.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onStay}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-fei-bg/[0.13] bg-fei-bg/[0.015] px-5 py-2 text-sm font-medium text-fei-bg/68 transition hover:border-fei-sky/45 hover:bg-fei-sky/[0.035] hover:text-fei-bg"
            >
              Stay and answer
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-fei-yellow px-5 py-2 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
  const roleSubtitle = selectedRole === 'Academy Director' ? 'Youth & Academy' : selectedRole === 'Head of Scouting' ? 'Recruitment Leadership' : selectedRole === 'Scout' ? 'Player Scouting & Recruitment' : selectedRole === 'Fitness Coach' ? 'Strength & Conditioning' : selectedRole === 'Performance Analyst' ? 'First Team Analysis' : selectedRole === 'Nutritionist' ? 'Performance Nutrition' : selectedRole === 'Physiotherapist' ? 'Medical & Rehabilitation' : selectedRole === 'Sports Psychologist' ? 'Mental Performance' : selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' ? 'First Team' : 'Senior Squad'

  const [section, setSection] = useState<Section>('intro')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [showUnansweredPrompt, setShowUnansweredPrompt] = useState(false)
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
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingDone, setRecordingDone] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [audioTestPlaying, setAudioTestPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submission, setSubmission] = useState<SubmissionReceipt | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const uses16ItemDiagnostic =
    selectedRole === 'Professional Player' ||
    selectedRole === 'Head Coach' ||
    selectedRole === 'Assistant Coach' ||
    selectedRole === 'Performance Analyst' ||
    selectedRole === 'Fitness Coach' ||
    selectedRole === 'Physiotherapist' ||
    selectedRole === 'Sports Psychologist' ||
    selectedRole === 'Nutritionist' ||
    selectedRole === 'Academy Director' ||
    selectedRole === 'Scout' ||
    selectedRole === 'Head of Scouting'
  const totalItems = uses16ItemDiagnostic ? 16 : 17

  const getDiagnosticProgressStates = (
    currentItem: number
  ): Record<number, 'completed' | 'skipped' | 'pending'> => {
    const objectiveItemIds = [
      activeItems.warmup[0]?.id,
      activeItems.warmup[1]?.id,
      activeItems.reading[0]?.id,
      activeItems.reading[1]?.id,
      activeItems.reading[2]?.id,
      activeItems.reading[3]?.id,
      activeItems.listening[0]?.id,
      activeItems.listening[1]?.id,
      activeItems.listening[2]?.id,
      activeItems.listening[3]?.id,
      activeItems.vocabulary[0]?.id,
      activeItems.vocabulary[1]?.id,
      activeItems.vocabulary[2]?.id,
      activeItems.vocabulary[3]?.id,
    ]

    const states: Record<number, 'completed' | 'skipped' | 'pending'> = {}

    for (let number = 1; number <= 16; number += 1) {
      if (number >= currentItem) {
        states[number] = 'pending'
        continue
      }

      if (number <= 14) {
        const itemId = objectiveItemIds[number - 1]
        states[number] = itemId && answers[itemId] ? 'completed' : 'skipped'
        continue
      }

      if (number === 15) {
        states[number] = writingText.trim() ? 'completed' : 'skipped'
        continue
      }

      states[number] = 'pending'
    }

    return states
  }

  // ── Security: disable copy/paste/right-click ──────────────────────────────────
  useEffect(() => {
    if (section === 'intro' || section === 'pending') return

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
    setShowUnansweredPrompt(false)
  }

  function productionTaskId(skill: 'writing' | 'speaking') {
    const roleSlug = selectedRole.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return `${roleSlug}-${skill}-v1`
  }

  function buildObjectiveEvidence(): ObjectiveItemEvidence[] {
    const sections = ['reading', 'listening', 'vocabulary'] as const

    return sections.flatMap((objectiveSection) =>
      activeItems[objectiveSection].map((item) => ({
        itemId: item.id,
        level: item.level as ObjectiveItemEvidence['level'],
        section: objectiveSection,
        correct: Boolean(answers[item.id]?.startsWith(item.correct)),
      })),
    )
  }

  async function submitAssessment() {
    if (saving) return

    setSaving(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.set('role', selectedRole)
      formData.set('objectiveEvidence', JSON.stringify(buildObjectiveEvidence()))
      formData.set('writingTaskId', productionTaskId('writing'))
      formData.set('writingResponse', writingText)
      formData.set('speakingTaskId', productionTaskId('speaking'))
      formData.set('speakingDurationSeconds', String(recordingTime))

      if (recordingBlob) {
        formData.set('speakingAudio', recordingBlob, `speaking.${recordingBlob.type.includes('mp4') ? 'm4a' : 'webm'}`)
      }

      const response = await fetch('/api/diagnostic/attempts', {
        method: 'POST',
        body: formData,
      })
      const payload = (await response.json()) as {
        attemptId?: string
        status?: SubmissionReceipt['status']
        message?: string
        error?: string
      }

      if (!response.ok || !payload.attemptId || !payload.status || !payload.message) {
        throw new Error(payload.error || 'The diagnostic could not be submitted.')
      }

      router.push('/diagnostic/results/unpaid-demo')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'The diagnostic could not be submitted.',
      )
    } finally {
      setSaving(false)
    }
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
      audioChunksRef.current = []
      setRecordingBlob(null)
      setRecordingDone(false)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const contentType = mediaRecorder.mimeType || 'audio/webm'
        setRecordingBlob(new Blob(audioChunksRef.current, { type: contentType }))
        setRecordingDone(true)
      }

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
  }

  function getItemNumber(section: Section, step: number): number {
    const map: Record<string, number> =
      (selectedRole === 'Professional Player' ||
        selectedRole === 'Head Coach' ||
        selectedRole === 'Assistant Coach' ||
        selectedRole === 'Performance Analyst' ||
        selectedRole === 'Fitness Coach' ||
        selectedRole === 'Physiotherapist' ||
        selectedRole === 'Sports Psychologist' ||
        selectedRole === 'Nutritionist' ||
        selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
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

              <div className="grid gap-3 lg:-mt-10">
                <section className="rounded-[1.75rem] border border-fei-bg/[0.16] bg-white p-5 shadow-[0_22px_60px_rgba(7,17,31,0.10)] sm:p-6 lg:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-fei-bg/48">
                    Before you begin
                  </p>

                  <div className="mt-4 grid gap-3">
                    {[
                      'Do not close or refresh the page until the assessment is complete.',
                      'Find a quiet place with a reliable internet connection.',
                      'Answer each question based on what you know. If you are not sure, you may continue to the next question without selecting an answer.',
                    ].map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-fei-sky/50 bg-fei-sky/[0.10] text-[11px] font-black text-fei-bg">
                          {index + 1}
                        </span>

                        <p className="text-[14px] leading-[1.55] text-fei-bg/68 sm:text-[15px]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[1.75rem] border border-fei-bg/[0.16] bg-white p-5 shadow-[0_22px_60px_rgba(7,17,31,0.10)] sm:p-6 lg:p-6">
                  <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent" />

                  <p className="text-xs font-black uppercase tracking-[0.3em] text-fei-bg/48">
                    Audio & microphone check
                  </p>

                  <h2 className="mt-3 text-[28px] font-black tracking-[-0.035em] text-fei-bg sm:text-3xl">
                    Check your setup
                  </h2>

                  <p className="mt-2 max-w-xl text-[15px] leading-6 text-fei-bg/60">
                    Check your audio and enable your microphone before starting the diagnostic.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={playAudioTest}
                      disabled={audioTestPlaying}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-fei-sky/50 bg-fei-sky/[0.06] px-5 py-2.5 text-sm font-bold text-fei-bg transition hover:-translate-y-0.5 hover:border-fei-sky/70 hover:bg-fei-sky/[0.11] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {audioTestPlaying ? 'Playing...' : 'Play test audio'}
                    </button>

                    {micPermission === 'granted' ? (
                      <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.08] px-5 py-2.5 text-sm font-bold text-green-700">
                        ✓ Microphone ready
                      </div>
                    ) : micPermission === 'denied' ? (
                      <button
                        type="button"
                        onClick={requestMic}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-500/20 bg-red-500/[0.06] px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-500/10"
                      >
                        Microphone access denied
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={requestMic}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-fei-yellow px-5 py-2.5 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
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
            (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
              ? 'max-w-[1080px] py-5 lg:py-6'
              : 'max-w-[1280px] py-8 lg:py-10'
          }`}
        >
          <div className={(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? 'mb-5' : 'mb-10'}>
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:pt-1">
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
                <DiagnosticProgressSidebar
                  currentItem={currentItem}
                  states={getDiagnosticProgressStates(currentItem)}
                />
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
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'max-w-[840px]'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
                <>
                  {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
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

              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
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
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? 'pb-6' : 'mt-8'
                }`}
              >
                {showUnansweredPrompt && !selected && (
                  <UnansweredModal
                    onStay={() => setShowUnansweredPrompt(false)}
                    onContinue={() => {
                      setShowUnansweredPrompt(false)
                      if (warmupStep < activeItems.warmup.length - 1) {
                        setWarmupStep(warmupStep + 1)
                      } else {
                        setSection('reading')
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      setShowUnansweredPrompt(true)
                      return
                    }
                    setShowUnansweredPrompt(false)
                    if (warmupStep < activeItems.warmup.length - 1) {
                      setWarmupStep(warmupStep + 1)
                    } else {
                      setSection('reading')
                    }
                  }}
                  className="inline-flex min-h-[56px] min-w-[250px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 text-base font-black text-fei-bg transition duration-300 hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {warmupStep < activeItems.warmup.length - 1
                      ? 'Next'
                      : 'Continue to Reading'}
                    <ChevronRightIcon />
                  </span>
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              {uses16ItemDiagnostic ? (
                <DiagnosticProgressSidebar
                  currentItem={getItemNumber('reading', readingStep)}
                  states={getDiagnosticProgressStates(getItemNumber('reading', readingStep))}
                />
              ) : (
                <SectionBadge label="Professional Reading" />
              )}
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
                <>
                  <div className="mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.025)]">
                    <div className="px-5 py-4 sm:px-6">
                      {(selectedRole === 'Assistant Coach' && !item.context.includes('\n\n')) ||
                      (selectedRole === 'Physiotherapist' && !item.context.includes('\n\n')) ||
                      (selectedRole === 'Sports Psychologist' && !item.context.includes('\n\n')) ||
                      (selectedRole === 'Head of Scouting' && !item.context.includes('\n\n')) ? (
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

                  <div className="mb-3">
                    <h1 className="max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl">
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting'}
                  />
                ))}
              </div>

              <div className={`flex justify-end ${
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? 'pb-6' : ''
              }`}>
                {showUnansweredPrompt && !selected && (
                  <UnansweredModal
                    onStay={() => setShowUnansweredPrompt(false)}
                    onContinue={() => {
                      setShowUnansweredPrompt(false)
                      if (readingStep < activeItems.reading.length - 1) {
                        setReadingStep(readingStep + 1)
                      } else {
                        setSection('listening')
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      setShowUnansweredPrompt(true)
                      return
                    }
                    setShowUnansweredPrompt(false)
                    if (readingStep < activeItems.reading.length - 1) {
                      setReadingStep(readingStep + 1)
                    } else {
                      setSection('listening')
                    }
                  }}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {readingStep < activeItems.reading.length - 1
                      ? 'Next'
                      : 'Continue to Listening'}
                    <ChevronRightIcon />
                  </span>
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-7 lg:grid-cols-[0.43fr_1.57fr] lg:gap-9'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              {uses16ItemDiagnostic ? (
                <DiagnosticProgressSidebar
                  currentItem={getItemNumber('listening', listeningStep)}
                  states={getDiagnosticProgressStates(getItemNumber('listening', listeningStep))}
                />
              ) : (
                <SectionBadge label="Listening in Context" />
              )}

            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
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
                                : selectedRole === 'Sports Psychologist'
                                  ? `/audio/diagnostics/sports-psychologist/sports-psychologist-listening-${listeningStep + 1}.mp3`
                                  : selectedRole === 'Nutritionist'
                                    ? `/audio/diagnostics/nutritionist/nutritionist-listening-${listeningStep + 1}.mp3`
                                    : selectedRole === 'Academy Director'
                                      ? `/audio/diagnostics/academy-director/academy-director-listening-${listeningStep + 1}.mp3`
                                      : selectedRole === 'Scout'
                                        ? `/audio/diagnostics/scout/scout-listening-${listeningStep + 1}.mp3`
                                        : selectedRole === 'Head of Scouting'
                                          ? `/audio/diagnostics/head-of-recruitment/head-of-recruitment-listening-${listeningStep + 1}.mp3`
                                          : undefined
                  }
                  minimal={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting'}
                />

              </div>

              <div
                className={
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
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
                              selectedRole === 'Physiotherapist' ||
                              selectedRole === 'Sports Psychologist' ||
                              selectedRole === 'Nutritionist' ||
                              selectedRole === 'Academy Director' ||
                              selectedRole === 'Scout' ||
                              selectedRole === 'Head of Scouting'
                            ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                            : selectedRole === 'Assistant Coach'
                              ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? 'pb-6' : ''
                }`}
              >
                {showUnansweredPrompt && !selected && (
                  <UnansweredModal
                    onStay={() => setShowUnansweredPrompt(false)}
                    onContinue={() => {
                      setShowUnansweredPrompt(false)
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel()
                      }
                      if (listeningStep < activeItems.listening.length - 1) {
                        setListeningStep(listeningStep + 1)
                      } else {
                        setSection('vocabulary')
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      setShowUnansweredPrompt(true)
                      return
                    }
                    setShowUnansweredPrompt(false)

                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel()
                    }

                    if (listeningStep < activeItems.listening.length - 1) {
                      setListeningStep(listeningStep + 1)
                    } else {
                      setSection('vocabulary')
                    }
                  }}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {listeningStep < activeItems.listening.length - 1
                      ? 'Next'
                      : 'Continue to Vocabulary'}
                    <ChevronRightIcon />
                  </span>
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
      selectedRole === 'Nutritionist'
        ? 'Nutritionist'
        :
      selectedRole === 'Head of Scouting'
        ? 'Head of Recruitment'
        : selectedRole === 'Scout'
          ? 'Scout'
          : fixedProfessionalPlayerSpeaker?.speaker ??
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

    const vocabularySetup =
      selectedRole === 'Head of Scouting'
        ? ''
        : item.context
            .replace(
              /\s*(?:A teammate shouts|A player asks|The coach says|The Head Coach says|The physiotherapist (?:asks|says)|The player says|The psychologist says|The report says|The assistant coach says|The Sporting Director says|The analyst says|The nutritionist (?:says|explains)|The nutrition plan says|The nutrition review states|The Academy Director says|The academy report says|The pathway review says|The Scout says|The recruitment report says|The Scout explains|The scouting review states):\s*[“"].*[”"]$/i,
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' ||
                    selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              {uses16ItemDiagnostic ? (
                <DiagnosticProgressSidebar
                  currentItem={getItemNumber('vocabulary', vocabStep)}
                  states={getDiagnosticProgressStates(getItemNumber('vocabulary', vocabStep))}
                />
              ) : (
                <SectionBadge label="Football Vocabulary" />
              )}
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
              {(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
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
                            selectedRole === 'Nutritionist'
                              ? '/avatars/nutritionist.png'
                              : selectedRole === 'Academy Director'
                                ? '/avatars/academy-director.png'
                                : selectedRole === 'Scout'
                                  ? '/avatars/scout.png'
                                  : selectedRole === 'Head of Scouting'
                                    ? '/avatars/head-of-recruitment.png'
                                    : fixedProfessionalPlayerSpeaker?.avatar ??
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
                    refined={selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting'}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end ${
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? 'pb-6' : ''
                }`}
              >
                {showUnansweredPrompt && !selected && (
                  <UnansweredModal
                    onStay={() => setShowUnansweredPrompt(false)}
                    onContinue={() => {
                      setShowUnansweredPrompt(false)
                      if (vocabStep < activeItems.vocabulary.length - 1) {
                        setVocabStep(vocabStep + 1)
                      } else if (
                        selectedRole === 'Professional Player' ||
                        selectedRole === 'Head Coach' ||
                        selectedRole === 'Assistant Coach' ||
                        selectedRole === 'Performance Analyst' ||
                        selectedRole === 'Fitness Coach' ||
                        selectedRole === 'Physiotherapist' ||
                        selectedRole === 'Sports Psychologist' ||
                        selectedRole === 'Nutritionist' ||
                        selectedRole === 'Academy Director' ||
                        selectedRole === 'Scout' ||
                        selectedRole === 'Head of Scouting'
                      ) {
                        setSection('writing')
                      } else {
                        setSection('functional')
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      setShowUnansweredPrompt(true)
                      return
                    }
                    setShowUnansweredPrompt(false)
                    if (vocabStep < activeItems.vocabulary.length - 1) {
                      setVocabStep(vocabStep + 1)
                    } else if (
                      selectedRole === 'Professional Player' ||
                      selectedRole === 'Head Coach' ||
                      selectedRole === 'Assistant Coach' ||
                      selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' ||
                      selectedRole === 'Sports Psychologist' ||
                      selectedRole === 'Nutritionist' ||
                      selectedRole === 'Academy Director' ||
                      selectedRole === 'Scout' ||
                      selectedRole === 'Head of Scouting'
                    ) {
                      setSection('writing')
                    } else {
                      setSection('functional')
                    }
                  }}
                  className="inline-flex min-h-[54px] min-w-[240px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-bg/[0.07] disabled:text-fei-bg/30"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {vocabStep < activeItems.vocabulary.length - 1
                      ? 'Next'
                      : (selectedRole === 'Professional Player' ||
                          selectedRole === 'Head Coach' ||
                          selectedRole === 'Assistant Coach' ||
                          selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                        ? 'Continue to Writing'
                        : 'Continue to Functional Communication'}
                    <ChevronRightIcon />
                  </span>
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              {uses16ItemDiagnostic ? (
                <DiagnosticProgressSidebar
                  currentItem={15}
                  states={getDiagnosticProgressStates(15)}
                />
              ) : (
                <SectionBadge label="Written Production" />
              )}
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'min-w-0 max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)] sm:px-6'
                : 'mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7'
            }
          >
            <div>
            <p
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'text-[10px] font-medium uppercase tracking-[0.07em] text-fei-bg/38'
                  : 'text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45'
              }
            >
              {'Situation'}
            </p>
            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                  : selectedRole === 'Head Coach'
                    ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                    : selectedRole === 'Assistant Coach'
                      ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                      : selectedRole === 'Performance Analyst' ||
                        selectedRole === 'Physiotherapist' ||
                        selectedRole === 'Sports Psychologist' ||
                        selectedRole === 'Head of Scouting'
                      ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                      : 'mt-5 text-base leading-8 text-fei-bg/70'
              }
            >
{selectedRole === 'Head Coach'
                ? 'Two hours before kick-off, your team faces an opponent that presses aggressively after backward passes and leaves space behind its fullbacks.'
                : selectedRole === 'Assistant Coach'
                  ? 'You have just finished a first-team training session. The unit work was effective at the start, but during the final repetitions the distance between midfield and defense increased, communication dropped, and players began reacting individually. The Head Coach has asked for a concise written debrief before the staff meeting.'
                  : selectedRole === 'Academy Director'
                    ? 'Two U19 players have recently trained with the first team. One has adapted well to the speed and tactical demands but still needs more consistency. The second has shown strong technical quality but has struggled when sessions become more physically and mentally demanding. The first-team staff want both players available more often.'
                    : selectedRole === 'Head of Scouting'
                      ? 'The club has budget for one major signing. The Head Coach wants an experienced striker who can contribute immediately, while the recruitment team has identified a younger midfielder who could become a key player within the next two seasons. Both profiles are strong, but the club cannot complete both deals in the same window.'
                      : selectedRole === 'Scout'
                        ? 'You have watched a winger across four matches. He is technically strong, creates chances consistently and fits the positional profile well. However, his influence drops significantly when opponents defend aggressively, and his decision-making becomes less reliable under pressure. Another club has recently started monitoring him.'
                        : selectedRole === 'Fitness Coach'
                          ? 'You are preparing a short update for the Head Coach before training. One player completed 90 minutes in the previous match. His recovery score is below his usual level, his legs feel heavy, and his recent high-speed running load is above his weekly average.'
                          : selectedRole === 'Performance Analyst'
                            ? 'You are preparing a short opposition note for the coaching staff. Across the last three matches, the opponent’s right fullback has moved very high during possession. When the ball is lost, the right center-back often has to defend wide, leaving more space between the center-backs.'
                            : selectedRole === 'Nutritionist'
                              ? 'A first-team midfielder is completing a congested period of three matches in eight days. His body mass has gradually decreased, his appetite is poor after late matches, and large recovery meals are affecting his sleep. He is still training normally, but the nutrition team wants to prevent the situation from affecting recovery.'
                              : selectedRole === 'Physiotherapist'
                                ? 'During the second half of a match, a player lands awkwardly after challenging for the ball and immediately reports pain in his right ankle. He leaves the pitch and is assessed after the match. There is moderate swelling, reduced range of motion, and pain when putting weight on the foot. No final diagnosis has been confirmed yet.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'A first-team player has asked for support after several difficult matches. He reports increased self-doubt, frustration after mistakes and difficulty switching off after games. His sleep has become less consistent, but he remains engaged in training and wants to continue playing. He has asked you not to share the personal details of your conversations with the coaching staff.'
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
                selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
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
                  selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                  : 'text-xl font-black leading-8 text-fei-bg'
              }
            >
              {selectedRole === 'Head Coach'
                ? 'Write a short pre-match message to the squad.'
                : selectedRole === 'Assistant Coach'
                  ? 'Write a 60–90-word debrief to the Head Coach.'
                  : selectedRole === 'Academy Director'
                    ? 'Write a 60–90-word update to the Sporting Director.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Write a 70–100-word recommendation to the Sporting Director.'
                      : selectedRole === 'Scout'
                        ? 'Write a 60–90-word scouting recommendation to the Director of Recruitment.'
                        : selectedRole === 'Fitness Coach'
                          ? 'Write a 60–90-word message to the Head Coach.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Write a 60–90-word opposition analysis memo for the coaching staff.'
                            : selectedRole === 'Nutritionist'
                              ? 'Write a 60–90-word update for the Head Coach.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Write a 60–90-word medical update for the coaching and performance staff.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Write a 60–90-word update for the Head Coach.'
                                  : 'Write a 30–80-word message to the physiotherapist describing the discomfort clearly and asking for an assessment.'}
            </p>

            {(selectedRole === 'Professional Player' ||
              selectedRole === 'Head Coach' ||
              selectedRole === 'Assistant Coach' ||
              selectedRole === 'Performance Analyst' ||
              selectedRole === 'Fitness Coach' ||
              selectedRole === 'Physiotherapist' ||
              selectedRole === 'Sports Psychologist' ||
              selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
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
                ) : selectedRole === 'Head of Scouting' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">identify the main recruitment priority;</li>
                    <li className="list-disc">explain the strategic reasoning behind your recommendation;</li>
                    <li className="list-disc">acknowledge the main risk or trade-off;</li>
                    <li className="list-disc">propose the next step for the recruitment team.</li>
                  </ul>
                ) : selectedRole === 'Scout' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">summarize the player’s main qualities using the available evidence;</li>
                    <li className="list-disc">explain how the player fits the recruitment profile;</li>
                    <li className="list-disc">identify the main uncertainty or recruitment risk;</li>
                    <li className="list-disc">recommend a clear next step in the scouting process.</li>
                  </ul>
                ) : selectedRole === 'Academy Director' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">summarize the readiness of both players;</li>
                    <li className="list-disc">distinguish between their current development needs;</li>
                    <li className="list-disc">recommend the next step for each player;</li>
                    <li className="list-disc">explain how the plan supports first-team exposure without rushing permanent promotion.</li>
                  </ul>
                ) : selectedRole === 'Nutritionist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">summarize the main nutrition concern;</li>
                    <li className="list-disc">explain how it may affect recovery;</li>
                    <li className="list-disc">describe the adjustment you recommend;</li>
                    <li className="list-disc">state what you will continue to monitor.</li>
                  </ul>
                ) : selectedRole === 'Sports Psychologist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">summarize the player’s current mental-performance status;</li>
                    <li className="list-disc">identify how it may be affecting performance;</li>
                    <li className="list-disc">protect confidential personal information;</li>
                    <li className="list-disc">recommend one appropriate way the coaching staff can support him.</li>
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
                        : selectedRole === 'Academy Director'
                          ? 'The two players currently show different levels of readiness...'
                          : selectedRole === 'Nutritionist'
                            ? 'The player’s current nutrition status suggests...'
                          : selectedRole === 'Sports Psychologist'
                            ? 'The player is currently showing...'
                            : 'Hi, I wanted to report...'
            }
            rows={6}
            className={`mb-2 w-full resize-none bg-white text-base leading-7 text-fei-bg placeholder:text-fei-bg/25 focus:border-fei-sky focus:outline-none ${
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
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
                          : selectedRole === 'Sports Psychologist'
                            ? 'Target: 60–90 words'
                            : selectedRole === 'Nutritionist'
                              ? 'Target: 60–90 words'
                              : selectedRole === 'Academy Director'
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'gap-6 lg:grid-cols-[0.3fr_1.7fr] lg:gap-16'
                : 'gap-10 lg:grid-cols-[0.48fr_1.52fr] lg:gap-12'
            }`}
          >
            <aside className="lg:sticky lg:top-10 lg:-translate-y-4">
              {uses16ItemDiagnostic ? (
                <DiagnosticProgressSidebar
                  currentItem={16}
                  states={getDiagnosticProgressStates(16)}
                />
              ) : (
                <SectionBadge label="Speaking Production" />
              )}
            </aside>

            <section
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'min-w-0 max-w-[840px] lg:-translate-y-4'
                  : undefined
              }
            >
          <div
            className={
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                ? 'mb-4 overflow-hidden rounded-xl border border-fei-bg/[0.11] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.025)] sm:px-6'
                : 'mb-8 border-l-4 border-fei-sky pl-5 sm:pl-7'
            }
          >
            <p
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Performance Analyst' || selectedRole === 'Fitness Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting')
                  ? 'text-[10px] font-medium uppercase tracking-[0.07em] text-fei-bg/38'
                  : 'text-xs font-black uppercase tracking-[0.22em] text-fei-bg/45'
              }
            >
              {'Situation'}
            </p>

            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                  : selectedRole === 'Head Coach'
                    ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                    : selectedRole === 'Assistant Coach'
                      ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                      : selectedRole === 'Performance Analyst' ||
                          selectedRole === 'Fitness Coach' ||
                          selectedRole === 'Physiotherapist' ||
                          selectedRole === 'Sports Psychologist' ||
                          selectedRole === 'Nutritionist' ||
                          selectedRole === 'Academy Director' ||
                          selectedRole === 'Head of Scouting'
                        ? 'mt-2 max-w-[760px] break-words text-[15px] font-normal leading-7 tracking-[-0.004em] text-fei-bg/72'
                        : 'mt-5 text-base leading-8 text-fei-bg/70'
              }
            >
{selectedRole === 'Head Coach'
                ? 'You substitute a senior player after 25 minutes because the opponent is repeatedly exploiting the space behind him. He reacts angrily near the technical area and says: “Why me? I wasn’t the only problem.”'
                : selectedRole === 'Assistant Coach'
                  ? 'During the final 11v11 block, the right winger presses the opposition fullback before the striker has blocked the pass into midfield. The central midfielder then holds his position, leaving an open route inside. The opposition plays through the pressure twice. The Head Coach asks you to stop the exercise and correct the two players before the restart.'
                  : selectedRole === 'Academy Director'
                    ? 'A parent tells you: “My daughter has been one of the best players in her age group all season. She is training well and scoring regularly. I don’t understand why she hasn’t moved up yet. What else does she need to prove?”'
                    : selectedRole === 'Head of Scouting'
                      ? 'The Head Coach wants the club to move immediately for a well-known striker who has just become available. He believes the player’s experience makes the decision obvious. However, your recruitment team has not completed the full assessment, and there are still questions about tactical fit, physical demands and financial value. The coach says: “We can’t afford to wait. Let’s make the move.”'
                      : selectedRole === 'Scout'
                        ? 'You are attending a live match with another scout. At halftime, your colleague says: “He looks like the right profile to me. I think we’ve seen enough.” You are not convinced yet. The player has shown good movement and technical quality, but you have not seen how he reacts defensively or under sustained pressure.'
                        : selectedRole === 'Fitness Coach'
                          ? 'You are speaking with a player after an evening match. He completed 90 minutes, recorded one of his highest high-speed running totals of the month, and performed several repeated sprint efforts during the final 20 minutes. He also returned from a hamstring injury three weeks ago and is still rebuilding his normal exposure to high-speed running. The team plays again in three days. Tomorrow is a recovery day, followed by one field session before the next match.'
                          : selectedRole === 'Performance Analyst'
                            ? 'During the staff meeting, the Head Coach says: “We had more of the ball in the second half, but we still struggled to create chances. What changed?” Your analysis shows that the team circulated possession deeper, received under more pressure in midfield, and completed fewer progressive actions into the final third.'
                            : selectedRole === 'Nutritionist'
                              ? 'A player tells you: “After evening matches I’m exhausted and I don’t feel like eating. I usually just drink something and go to bed. I know recovery is important, but a full meal feels impossible.”'
                              : selectedRole === 'Physiotherapist'
                                ? 'A player is recovering from a knee injury. He has completed most of the rehabilitation process and has trained with the team twice. He is pain-free during normal football actions, but he still shows some loss of control during repeated high-speed changes of direction. The Head Coach wants to know if he can be available for an important match in three days.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Twenty minutes before an important match, a player tells you: “I keep thinking about the mistakes I made last week. If I make another one tonight, I could lose my place. I know I should focus, but I can’t stop thinking about it.”'
                                  : 'After a difficult 2–1 defeat, a journalist asks you: “Some supporters are saying the team lacked commitment tonight. Do you agree?”'}
            </p>
          </div>

          <div className="mb-8">
            <p
              className={
                selectedRole === 'Professional Player'
                  ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                  : selectedRole === 'Head Coach'
                    ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                    : selectedRole === 'Assistant Coach'
                      ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                      : selectedRole === 'Performance Analyst' ||
                          selectedRole === 'Fitness Coach' ||
                          selectedRole === 'Physiotherapist' ||
                          selectedRole === 'Sports Psychologist' ||
                          selectedRole === 'Nutritionist' ||
                          selectedRole === 'Academy Director' ||
                          selectedRole === 'Head of Scouting'
                        ? 'max-w-[780px] text-lg font-semibold leading-7 tracking-[-0.008em] text-fei-bg/88 sm:text-xl'
                        : 'text-xl font-black leading-8 text-fei-bg'
              }
            >
              {selectedRole === 'Head Coach'
                ? 'Respond to the player in a calm, clear and authoritative way.'
                : selectedRole === 'Assistant Coach'
                  ? 'Deliver a 45–60 second coaching intervention to the two players.'
                  : selectedRole === 'Academy Director'
                    ? 'Give a 45–60 second response directly to the parent.'
                    : selectedRole === 'Head of Scouting'
                      ? 'Give a 45–60 second response to the Head Coach.'
                      : selectedRole === 'Scout'
                        ? 'Give a 45–60 second response to your colleague.'
                        : selectedRole === 'Fitness Coach'
                          ? 'Give a 45–60 second explanation to the player about how he should manage the next two days.'
                          : selectedRole === 'Performance Analyst'
                            ? 'Give a 45–60 second response to the Head Coach.'
                            : selectedRole === 'Nutritionist'
                              ? 'Give a 45–60 second response directly to the player.'
                              : selectedRole === 'Physiotherapist'
                                ? 'Give a 45–60 second update to the Head Coach.'
                                : selectedRole === 'Sports Psychologist'
                                  ? 'Give a 45–60 second response to the player.'
                                  : 'Record a 45–60 second response.'}
            </p>
            {(selectedRole === 'Professional Player' ||
              selectedRole === 'Head Coach' ||
              selectedRole === 'Assistant Coach' ||
              selectedRole === 'Performance Analyst' ||
              selectedRole === 'Fitness Coach' ||
              selectedRole === 'Physiotherapist' ||
              selectedRole === 'Sports Psychologist' ||
              selectedRole === 'Nutritionist' || selectedRole === 'Academy Director' || selectedRole === 'Scout' || selectedRole === 'Head of Scouting') ? (
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
                ) : selectedRole === 'Head of Scouting' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the urgency of the situation;</li>
                    <li className="list-disc">explain why the current evidence is not yet sufficient;</li>
                    <li className="list-disc">identify the main factors that still need to be confirmed;</li>
                    <li className="list-disc">propose a clear and realistic next step.</li>
                  </ul>
                ) : selectedRole === 'Scout' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">respond professionally to your colleague’s opinion;</li>
                    <li className="list-disc">explain why you think the evidence is still incomplete;</li>
                    <li className="list-disc">identify what you want to observe in the second half;</li>
                    <li className="list-disc">agree on a clear observation focus before the match restarts.</li>
                  </ul>
                ) : selectedRole === 'Academy Director' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the player’s strong progress;</li>
                    <li className="list-disc">explain that promotion depends on more than current performance;</li>
                    <li className="list-disc">clarify one or two areas the academy still wants to evaluate;</li>
                    <li className="list-disc">give the parent a clear idea of what happens next.</li>
                  </ul>
                ) : selectedRole === 'Nutritionist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the player’s concern;</li>
                    <li className="list-disc">explain why regularly skipping recovery intake may become a problem;</li>
                    <li className="list-disc">suggest one or two realistic alternatives to a full meal;</li>
                    <li className="list-disc">agree on a simple plan for the next evening match.</li>
                  </ul>
                ) : selectedRole === 'Sports Psychologist' ? (
                  <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-fei-bg/52">
                    <li className="list-disc">acknowledge the player’s concern without reinforcing the fear;</li>
                    <li className="list-disc">help him separate previous mistakes from the next performance;</li>
                    <li className="list-disc">redirect his attention toward controllable actions;</li>
                    <li className="list-disc">give one practical strategy he can use before kick-off;</li>
                    <li className="list-disc">finish with a clear performance-focused message.</li>
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
              (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Assistant Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist')
                ? 'mb-4 rounded-xl border border-fei-bg/[0.09] bg-white p-4 sm:p-5'
                : ''
            }
          >
          {isRecording && (
            <div
              className={
                (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist')
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
                  ? 'Your sample is shorter than recommended, but duration will not determine your level.'
                  : 'Your speaking sample has been captured.'}
              </p>
            </div>
          )}

          <div className={(selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist') ? 'mb-3' : 'mb-4'}>
            {!isRecording && !recordingDone && (
              <button
                onClick={startRecording}
                className={
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist')
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
                  (selectedRole === 'Professional Player' || selectedRole === 'Head Coach' || selectedRole === 'Physiotherapist' || selectedRole === 'Sports Psychologist' || selectedRole === 'Nutritionist')
                    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-red-500 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/[0.05]'
                    : 'inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 bg-white px-8 py-3.5 font-bold text-red-600 transition hover:bg-red-500/[0.06]'
                }
              >
                <span className="h-3 w-3 rounded-[3px] bg-current" />
                Stop recording
              </button>
            )}
          </div>

          {submitError && (
            <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          {recordingDone && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRecordingDone(false)
                  setRecordingTime(0)
                  setIsRecording(false)
                  setRecordingBlob(null)
                  audioChunksRef.current = []
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
                onClick={submitAssessment}
                disabled={saving || !recordingBlob}
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
              onClick={submitAssessment}
              disabled={saving}
              className="mt-5 w-full text-center text-xs text-fei-bg/35 transition hover:text-fei-bg/55"
            >
              Submit without speaking recording
            </button>
          )}
          </div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  // PENDING EVALUATION
  if (section === 'pending' && submission) {
    const needsSpeakingReview = submission.status === 'human_review_required'

    return (
      <div className="min-h-screen bg-[#F6F7F9] text-fei-bg">
        <header className="border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center justify-between px-6 sm:px-8">
            <Link href="/" className="flex items-center">
              <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-9 w-auto" />
              <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />
              <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
                Football English Intelligence
              </span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/38">
              Diagnostic assessment
            </p>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[760px] items-center px-6 py-12 sm:px-8">
          <section className="w-full rounded-3xl border border-fei-bg/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fei-sky/10 text-2xl text-fei-sky">
              ✓
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-fei-sky">
              Submission received
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-fei-bg sm:text-4xl">
              Your initial FEI profile is ready
            </h1>
            <p className="mt-5 text-base leading-7 text-fei-bg/60">
              {needsSpeakingReview
                ? 'Your responses were saved successfully. You can view your initial profile now.'
                : 'Your responses, Writing response, and Speaking recording were saved successfully. You can view your initial profile now.'}
            </p>
            <p className="mt-4 text-sm leading-6 text-fei-bg/50">
              This initial profile is based on your objective responses. Writing and Speaking will refine your final FEI level later. Word count, keywords, and recording duration do not determine your level.
            </p>
            <div className="mt-8 rounded-2xl border border-fei-bg/8 bg-fei-bg/[0.03] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-fei-bg/35">
                Attempt reference
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-fei-bg/70">
                {submission.attemptId}
              </p>
            </div>
            <Link
              href={`/diagnostic/results/${submission.attemptId}`}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-fei-yellow px-6 py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              View your initial profile
            </Link>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center text-sm font-semibold text-fei-bg/50 transition hover:text-fei-bg"
            >
              Return to dashboard
            </Link>
          </section>
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
