# Wormle Image Generator

This index.js script uses [Puppeteer](https://github.com/puppeteer/puppeteer) to capture a screenshot of the daily [wormle](https://wormle.com) game before and after completion, and then uploads it to an S3 bucket.

## Local Development

Run the following command:
`node --env-file=.env test.js`
to execute the lambda handler locally.
