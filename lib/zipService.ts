/**
 * Fetches address information from a Japanese Zip Code API.
 * Uses zipcloud public API.
 */
export const fetchAddressByZip = async (zip: string): Promise<{ prefecture: string; city: string } | null> => {
  // Remove hyphens
  const cleanZip = zip.replace(/-/g, '');
  
  if (cleanZip.length !== 7) {
    return null;
  }

  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
    const data = await response.json();

    if (data.status === 200 && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        prefecture: result.address1,
        city: result.address2 + result.address3,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch address", error);
    return null;
  }
};
