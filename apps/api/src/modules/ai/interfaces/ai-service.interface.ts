export interface IAiService {
  enhanceDescription(prompt: string): Promise<string>;
}
