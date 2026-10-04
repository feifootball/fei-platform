export interface ProductionTaskPrompt {
  situation: string
  task: string
  requirements: string[]
}

export interface RoleProductionTasks {
  writing: ProductionTaskPrompt
  speaking: ProductionTaskPrompt
}

const TASKS_V1: Record<string, RoleProductionTasks> = {
  'Professional Player': {
    writing: {
      situation: 'After training, you feel tightness in your left hamstring. It started during the second half of the session after a sharp turn while sprinting and increased slightly during the cool-down. You want to report it to the physiotherapist before the next session.',
      task: 'Write a 30–80-word message to the physiotherapist describing the discomfort clearly and asking for an assessment.',
      requirements: [
        'Describe where and when the discomfort started.',
        'Explain what movement caused it and how it changed.',
        'State clearly what support or assessment you need.',
      ],
    },
    speaking: {
      situation: 'After a difficult 2–1 defeat, a journalist asks you: “Some supporters are saying the team lacked commitment tonight. Do you agree?”',
      task: 'Record a 45–60 second response.',
      requirements: [
        'Acknowledge the result and the criticism.',
        'Protect the team without blaming teammates.',
        'Explain your view in a calm, professional media tone.',
      ],
    },
  },
  'Head Coach': {
    writing: {
      situation: 'Two hours before kick-off, your team faces an opponent that presses aggressively after backward passes and leaves space behind its fullbacks.',
      task: 'Write a short pre-match message to the squad.',
      requirements: [
        'Identify the main risk when playing through pressure.',
        'Give two clear tactical priorities.',
        'State the communication and decision-making standard you expect.',
      ],
    },
    speaking: {
      situation: 'You substitute a senior player after 25 minutes because the opponent is repeatedly exploiting the space behind him. He reacts angrily near the technical area and says: “Why me? I wasn’t the only problem.”',
      task: 'Respond to the player in a calm, clear and authoritative way for 45–60 seconds.',
      requirements: [
        'Acknowledge the player’s frustration.',
        'Explain the tactical reason without blaming him.',
        'Maintain your authority while protecting the relationship.',
      ],
    },
  },
  'Assistant Coach': {
    writing: {
      situation: 'You have just finished a first-team training session. The unit work was effective at the start, but during the final repetitions the distance between midfield and defense increased, communication dropped, and players began reacting individually. The Head Coach has asked for a concise written debrief before the staff meeting.',
      task: 'Write a 60–90-word debrief to the Head Coach.',
      requirements: [
        'Identify what worked before the problem developed.',
        'Explain the main issue using observable evidence.',
        'Recommend one clear priority for the next session.',
      ],
    },
    speaking: {
      situation: 'During the final 11v11 block, the right winger presses the opposition fullback before the striker has blocked the pass into midfield. The central midfielder then holds his position, leaving an open route inside. The opposition plays through the pressure twice. The Head Coach asks you to stop the exercise and correct the two players before the restart.',
      task: 'Deliver a 45–60 second coaching intervention to the two players.',
      requirements: [
        'Identify the coordination problem between the two players.',
        'Clarify the pressing trigger and the supporting player’s responsibility.',
        'Finish with one clear instruction for the restart.',
      ],
    },
  },
  'Performance Analyst': {
    writing: {
      situation: 'You are preparing a short opposition note for the coaching staff. Across the last three matches, the opponent’s right fullback has moved very high during possession. When the ball is lost, the right center-back often has to defend wide, leaving more space between the center-backs.',
      task: 'Write a 60–90-word opposition analysis memo for the coaching staff.',
      requirements: [
        'Identify the recurring tactical pattern.',
        'Explain the vulnerability using the evidence provided.',
        'Recommend one clear way your team could exploit it.',
      ],
    },
    speaking: {
      situation: 'During the staff meeting, the Head Coach says: “We had more of the ball in the second half, but we still struggled to create chances. What changed?” Your analysis shows that the team circulated possession deeper, received under more pressure in midfield, and completed fewer progressive actions into the final third.',
      task: 'Give a 45–60 second response to the Head Coach.',
      requirements: [
        'Explain why more possession did not mean better attacking control.',
        'Use the evidence to identify what changed after halftime.',
        'Finish with one clear tactical point for the staff to review.',
      ],
    },
  },
  'Fitness Coach': {
    writing: {
      situation: 'You are preparing a short update for the Head Coach before training. One player completed 90 minutes in the previous match. His recovery score is below his usual level, his legs feel heavy, and his recent high-speed running load is above his weekly average.',
      task: 'Write a 60–90-word message to the Head Coach.',
      requirements: [
        'Summarize the player’s current physical status.',
        'Use the available evidence to explain your concern.',
        'Recommend one appropriate adjustment to today’s training load.',
      ],
    },
    speaking: {
      situation: 'You are speaking with a player after an evening match. He completed 90 minutes, recorded one of his highest high-speed running totals of the month, and performed several repeated sprint efforts during the final 20 minutes. He also returned from a hamstring injury three weeks ago and is still rebuilding his normal exposure to high-speed running. The team plays again in three days. Tomorrow is a recovery day, followed by one field session before the next match.',
      task: 'Give a 45–60 second explanation to the player about how he should manage the next two days.',
      requirements: [
        'Explain what the match demands mean for his recovery.',
        'Consider his recent return from injury when explaining the next training session.',
        'Clarify what may need to be adjusted compared with normal training.',
        'Explain what should be monitored before the next match.',
        'Keep the message clear, practical and focused on readiness.',
      ],
    },
  },
  Nutritionist: {
    writing: {
      situation: 'A first-team midfielder is completing a congested period of three matches in eight days. His body mass has gradually decreased, his appetite is poor after late matches, and large recovery meals are affecting his sleep. He is still training normally, but the nutrition team wants to prevent the situation from affecting recovery.',
      task: 'Write a 60–90-word update for the Head Coach.',
      requirements: [
        'Summarize the main nutrition concern.',
        'Explain how it may affect recovery.',
        'Describe the adjustment you recommend.',
        'State what you will continue to monitor.',
      ],
    },
    speaking: {
      situation: 'A player tells you: “After evening matches I’m exhausted and I don’t feel like eating. I usually just drink something and go to bed. I know recovery is important, but a full meal feels impossible.”',
      task: 'Give a 45–60 second response directly to the player.',
      requirements: [
        'Acknowledge the player’s concern.',
        'Explain why regularly skipping recovery intake may become a problem.',
        'Suggest one or two realistic alternatives to a full meal.',
        'Agree on a simple plan for the next evening match.',
      ],
    },
  },
  Physiotherapist: {
    writing: {
      situation: 'During the second half of a match, a player lands awkwardly after challenging for the ball and immediately reports pain in his right ankle. He leaves the pitch and is assessed after the match. There is moderate swelling, reduced range of motion, and pain when putting weight on the foot. No final diagnosis has been confirmed yet.',
      task: 'Write a 60–90-word medical update for the coaching and performance staff.',
      requirements: [
        'Explain what happened during the match.',
        'Describe the player’s current symptoms.',
        'Summarize what the initial assessment shows.',
        'State clearly what should happen next.',
      ],
    },
    speaking: {
      situation: 'A player is recovering from a knee injury. He has completed most of the rehabilitation process and has trained with the team twice. He is pain-free during normal football actions, but he still shows some loss of control during repeated high-speed changes of direction. The Head Coach wants to know if he can be available for an important match in three days.',
      task: 'Give a 45–60 second update to the Head Coach.',
      requirements: [
        'Explain what the player can currently do.',
        'Identify what is still limiting his return.',
        'Explain how you interpret the current risk.',
        'Recommend what should happen over the next three days.',
        'State whether match availability can be confirmed yet.',
      ],
    },
  },
  'Sports Psychologist': {
    writing: {
      situation: 'A first-team player has asked for support after several difficult matches. He reports increased self-doubt, frustration after mistakes and difficulty switching off after games. His sleep has become less consistent, but he remains engaged in training and wants to continue playing. He has asked you not to share the personal details of your conversations with the coaching staff.',
      task: 'Write a 60–90-word update for the Head Coach.',
      requirements: [
        'Summarize the player’s current mental-performance status.',
        'Identify how it may be affecting performance.',
        'Protect confidential personal information.',
        'Recommend one appropriate way the coaching staff can support him.',
      ],
    },
    speaking: {
      situation: 'Twenty minutes before an important match, a player tells you: “I keep thinking about the mistakes I made last week. If I make another one tonight, I could lose my place. I know I should focus, but I can’t stop thinking about it.”',
      task: 'Give a 45–60 second response to the player.',
      requirements: [
        'Acknowledge the player’s concern without reinforcing the fear.',
        'Help him separate previous mistakes from the next performance.',
        'Redirect his attention toward controllable actions.',
        'Give one practical strategy he can use before kick-off.',
        'Finish with a clear performance-focused message.',
      ],
    },
  },
  'Academy Director': {
    writing: {
      situation: 'Two U19 players have recently trained with the first team. One has adapted well to the speed and tactical demands but still needs more consistency. The second has shown strong technical quality but has struggled when sessions become more physically and mentally demanding. The first-team staff want both players available more often.',
      task: 'Write a 60–90-word update to the Sporting Director.',
      requirements: [
        'Summarize the readiness of both players.',
        'Distinguish between their current development needs.',
        'Recommend the next step for each player.',
        'Explain how the plan supports first-team exposure without rushing permanent promotion.',
      ],
    },
    speaking: {
      situation: 'A parent tells you: “My daughter has been one of the best players in her age group all season. She is training well and scoring regularly. I don’t understand why she hasn’t moved up yet. What else does she need to prove?”',
      task: 'Give a 45–60 second response directly to the parent.',
      requirements: [
        'Acknowledge the player’s strong progress.',
        'Explain that promotion depends on more than current performance.',
        'Clarify one or two areas the academy still wants to evaluate.',
        'Give the parent a clear idea of what happens next.',
      ],
    },
  },
  'Head of Scouting': {
    writing: {
      situation: 'The club has budget for one major signing. The Head Coach wants an experienced striker who can contribute immediately, while the recruitment team has identified a younger midfielder who could become a key player within the next two seasons. Both profiles are strong, but the club cannot complete both deals in the same window.',
      task: 'Write a 70–100-word recommendation to the Sporting Director.',
      requirements: [
        'Identify the main recruitment priority.',
        'Explain the strategic reasoning behind your recommendation.',
        'Acknowledge the main risk or trade-off.',
        'Propose the next step for the recruitment team.',
      ],
    },
    speaking: {
      situation: 'The Head Coach wants the club to move immediately for a well-known striker who has just become available. He believes the player’s experience makes the decision obvious. However, your recruitment team has not completed the full assessment, and there are still questions about tactical fit, physical demands and financial value. The coach says: “We can’t afford to wait. Let’s make the move.”',
      task: 'Give a 45–60 second response to the Head Coach.',
      requirements: [
        'Acknowledge the urgency of the situation.',
        'Explain why the current evidence is not yet sufficient.',
        'Identify the main factors that still need to be confirmed.',
        'Propose a clear and realistic next step.',
      ],
    },
  },
  Scout: {
    writing: {
      situation: 'You have watched a winger across four matches. He is technically strong, creates chances consistently and fits the positional profile well. However, his influence drops significantly when opponents defend aggressively, and his decision-making becomes less reliable under pressure. Another club has recently started monitoring him.',
      task: 'Write a 60–90-word scouting recommendation to the Director of Recruitment.',
      requirements: [
        'Summarize the player’s main qualities using the available evidence.',
        'Explain how the player fits the recruitment profile.',
        'Identify the main uncertainty or recruitment risk.',
        'Recommend a clear next step in the scouting process.',
      ],
    },
    speaking: {
      situation: 'You are attending a live match with another scout. At halftime, your colleague says: “He looks like the right profile to me. I think we’ve seen enough.” You are not convinced yet. The player has shown good movement and technical quality, but you have not seen how he reacts defensively or under sustained pressure.',
      task: 'Give a 45–60 second response to your colleague.',
      requirements: [
        'Respond professionally to your colleague’s opinion.',
        'Explain why you think the evidence is still incomplete.',
        'Identify what you want to observe in the second half.',
        'Agree on a clear observation focus before the match restarts.',
      ],
    },
  },
}

const FALLBACK_TASKS: RoleProductionTasks = {
  writing: {
    situation: 'Complete the role-specific written production task shown in the diagnostic.',
    task: 'Write 3–5 sentences in professional English.',
    requirements: ['Respond clearly and appropriately for the professional context.'],
  },
  speaking: {
    situation: 'Complete the role-specific spoken production task shown in the diagnostic.',
    task: 'Record a 45–60 second response.',
    requirements: ['Respond clearly and appropriately for the professional context.'],
  },
}

export function getProductionTasks(role: string, version = '1.0.0') {
  if (version !== '1.0.0') return FALLBACK_TASKS
  return TASKS_V1[role] ?? FALLBACK_TASKS
}
