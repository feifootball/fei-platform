# FEI diagnostic scoring foundation

This module is the product boundary for FEI diagnostic scoring v1.

## What it enforces

- Writing and Speaking are accepted only as structured evaluations.
- Writing level is never derived from word count, sentence count, or keywords.
- Speaking level is never derived from recording duration.
- The final result remains pending until both production tasks have a valid evaluation.
- Insufficient evidence and technical failure are review states, not low scores.
- Writing C1 applies the calibrated FEI guardrails.
- The current progressive objective threshold is preserved: at least two correct A2, B1, B2, and C1 items in sequence, with a C1 production gate for final C1 placement.

## No-cost mode

No OpenAI or Anthropic API is enabled. Evaluations can enter the module through:

1. fixture JSON;
2. manually imported model JSON;
3. human review.

When a production task is submitted without an imported evaluation, the platform must save the response and show it as pending evaluation. It must not create a provisional language level from surface features.

## Product integration

The assessment route now captures the real Speaking recording and submits it with the Writing response and objective evidence. A new attempt stays pending until structured evaluations exist. Submitting without Speaking audio creates a manual-review state.

The Supabase migration must be applied before the application change is merged. It creates immutable attempts, versioned production evaluations, final results, and a private audio bucket with user-level access policies.

The admin review queue shows the exact versioned task prompt, Writing response, and private Speaking recording. It prepares the no-cost external evaluation prompt, validates imported JSON, stores versioned evaluations, and publishes the calculated result to the user-facing status page.
