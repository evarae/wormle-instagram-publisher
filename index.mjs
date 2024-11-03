import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const GAME_GRID_CLASS = ".puppeteer-target";
const OUTPUT_PATH_UNSOLVED = "imageUnsolved.jpg";
const OUTPUT_PATH_SOLVED = "imageSolved.jpg";
const SOLVE_PUZZLE_COMMAND = "window.Wormle.solvePuzzle()";

async function uploadToS3(s3Client, filename, body) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: body,
    });

    const response = await s3Client.send(command);
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
  }
}

export const handler = async (event, context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));
  await main();
};

async function main() {
  console.log("Creating chromium browser...");
  //Using the lightweight chromium build doesn't work locally, see https://github.com/Sparticuz/chromium?tab=readme-ov-file#running-locally--headlessheadful-mode
  const browser = await puppeteer.launch({
    args: process.env.IS_LOCAL ? puppeteer.defaultArgs() : chromium.args,
    executablePath: process.env.IS_LOCAL
      ? process.env.LOCAL_CHROME_PATH
      : await chromium.executablePath(),
    headless: process.env.IS_LOCAL ? false : chromium.headless,
  });

  console.log("Generating screenshots...");
  const page = await browser.newPage();

  //Results in higher resolution image than the default
  await page.setViewport({
    width: 800,
    height: 800,
    deviceScaleFactor: 2,
  });

  await page.goto(process.env.WORMLE_URL);

  //hide demo modal
  await page.locator("h1").click();

  //Get height/width of the game
  const { width, height } = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return { width: null, height: null };
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, GAME_GRID_CLASS);

  const max = height > width ? height : width;

  await page.addStyleTag({
    content: `${GAME_GRID_CLASS}{height: ${max}px; width: ${max}px; justify-content: center; padding: 20px}`,
  });

  const unsolvedGameContainer = await page.waitForSelector(GAME_GRID_CLASS);
  const screenshotUnsolved = await unsolvedGameContainer.screenshot();

  await page.evaluate(SOLVE_PUZZLE_COMMAND);

  //hide win modal
  await page.locator("h1").click();

  const solvedGameContainer = await page.waitForSelector(GAME_GRID_CLASS);
  const screenshotSolved = await solvedGameContainer.screenshot();

  console.log("Uploading to S3...");

  //Upload screenshots to S3
  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
  });

  uploadToS3(s3Client, OUTPUT_PATH_UNSOLVED, screenshotUnsolved);
  uploadToS3(s3Client, OUTPUT_PATH_SOLVED, screenshotSolved);

  await page.close();
  await browser.close();
}
