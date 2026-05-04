


const searchGoogleImages = async (text) => {
  const googleImages = [];
  const apiKey = process.env.REACT_APP_GOOGLE_API;
  const cseId = process.env.REACT_APP_CSE_ID;

  if (!apiKey || !cseId) {
    throw new Error('No API Key provided for google search');
  }

  const numberOfResults = 3;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(text)}&searchType=image&num=${numberOfResults}`;
  try {
    const response = await fetch(url, {});
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data && data.items && data.items.length > 0) {
      debugger;
      data.items.forEach((item) => {
        let imageUrl = item.pagemap?.cse_image?.[0]?.src || item.link;
        if (!imageUrl) {
          googleImages.push(item);
        } else {
          console.warn(`${item} was found but with no image url`);
        }
      })
    }

    return googleImages;
  } catch (error) {
    console.error(error);
  }
}

export default searchGoogleImages;