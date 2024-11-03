async function postAndPublishToInstagram() {
  const caption = `Testing wormle post: ${Date.now()}`;

  try {
    // Step 1: Create a media container
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url:
            "https://wormle-screenshots.s3.us-east-1.amazonaws.com/imageUnsolved.jpg",
          caption: caption,
          access_token: process.env.ACCESS_TOKEN,
        }),
      }
    );

    const mediaData = await mediaResponse.json();

    if (!mediaData.id) {
      throw new Error("Failed to create media container.");
    }

    const creationId = mediaData.id;

    // Step 2: Publish the media
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
      console.log("Post published successfully with ID:", publishData.id);
    } else {
      throw new Error("Failed to publish media.");
    }
  } catch (error) {
    console.error("Error posting to Instagram:", error);
  }
}

export const handler = async (event, context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));
  await postAndPublishToInstagram();
};
