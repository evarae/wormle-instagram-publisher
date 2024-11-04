async function postCarouselToInstagram() {
  const CAPTION =
    "Have you beaten today's wormle? Share your results below!\n\n#wormle #dailygame";

  const imageUrls = [
    process.env.UNSOLVED_IMAGE_URL,
    process.env.SPOILER_IMAGE_URL,
    process.env.SOLVED_IMAGE_URL,
  ];

  try {
    // Step 1: Create media containers for each image
    const mediaIds = [];
    for (const imageUrl of imageUrls) {
      const mediaResponse = await fetch(
        `https://graph.instagram.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: process.env.ACCESS_TOKEN,
          }),
        }
      );

      const mediaData = await mediaResponse.json();

      if (mediaData.id) {
        mediaIds.push(mediaData.id);
      } else {
        throw new Error("Failed to create media container for image.");
      }
    }

    // Step 2: Create the carousel container with the media IDs
    const carouselResponse = await fetch(
      `https://graph.instagram.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "CAROUSEL",
          caption: CAPTION,
          children: mediaIds,
          access_token: process.env.ACCESS_TOKEN,
        }),
      }
    );

    const carouselData = await carouselResponse.json();

    if (!carouselData.id) {
      throw new Error("Failed to create carousel container.");
    }

    const creationId = carouselData.id;

    // Step 3: Publish the carousel
    const publishResponse = await fetch(
      `https://graph.instagram.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: process.env.ACCESS_TOKEN,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.id) {
      console.log(
        "Carousel post published successfully with ID:",
        publishData.id
      );
    } else {
      throw new Error("Failed to publish carousel.");
    }
  } catch (error) {
    console.error("Error posting carousel to Instagram:", error);
  }
}

export const handler = async (event, context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));
  await postCarouselToInstagram();
};
