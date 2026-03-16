import { IMagicWordsData } from '../domain/MagicWordsEntity';

export class MagicWordsApiService {
  private static readonly API_URL = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";

  static async fetchData(): Promise<IMagicWordsData> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch magic words data: ${response.statusText}`);
    }
    return response.json();
  }
}
