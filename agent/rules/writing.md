# Writing rules

How an agent writes anything a person will read: reports, specs, reviews, documents, chat replies.

1. **Answer first.** The first sentence is the result. Explanation comes after, only if needed.
2. **Say exactly what you mean.** No idioms, metaphors, sarcasm or hints.
3. **Be specific.** Exact names, exact buttons, exact numbers, exact file paths. Never "soon", "a few", "some".
4. **Define every term the first time.** Do not assume the reader knows a field name or an acronym. Say what the thing is in plain words, then give the name in backticks.
5. **Lead with what the user sees.** For a bug or a review comment: first what a person sees on screen, then the technical cause.
6. **Short.** Numbered steps for anything the reader must do. One step or one question at a time when the task is long.
7. **A saved document starts with "Context you need before reading"**: each term the document uses, defined in one line.
8. **A saved document ends with a status block**: Done / Not done / What you must do.
9. **Say what is not verified.** If you did not run it, read it or see it, say so. Never present a guess as a fact.
10. **Ask when the request is ambiguous.** One question, then wait.
11. **No extra suggestions** unless the reader asked for them.
12. **Language.** Skill and rule files are in English. What the agent writes for the reader uses the profile's `output_language`.
13. **When the output leads to a message** (GitHub, Linear, chat), add a "Draft message" section with the exact text. Do not send it unless `agent/rules/ask-first.md` allows it.
