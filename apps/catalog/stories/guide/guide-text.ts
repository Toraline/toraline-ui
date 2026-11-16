/**
 * The text of the guide without its line 3, the line that links to the guide
 * in the other language ("**English** | [Português](guide.pt-BR.md)").
 * The catalog cannot open that file; its toolbar has the control "Language".
 */
export function withoutLanguageLine(guideText: string): string {
  return guideText.replace(
    /^(\*\*English\*\* \| \[Português\]\(.*\)|\[English\]\(.*\) \| \*\*Português\*\*)\n\n/m,
    "",
  );
}
