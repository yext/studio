/**
 * TODO(developer): Uncomment these variables before running the sample.\
 * (Not necessary if passing values as arguments)
 */
const projectId = 'studio-buddy-395317';
const googleLocation = 'us-central1';
import aiplatform, {helpers} from '@google-cloud/aiplatform'

// Imports the Google Cloud Prediction service client
const {PredictionServiceClient} = aiplatform.v1;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const publisher = 'google';
const model = 'text-bison@001';

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient(clientOptions);

export async function callTextBison(prompt) {
  // Configure the parent resource
  const endpoint = `projects/${projectId}/locations/${googleLocation}/publishers/${publisher}/models/${model}`;

  const googlePrompt = {prompt};
  const instanceValue = helpers.toValue(googlePrompt);
  const instances = [instanceValue];

  const parameter = {
    temperature: 0,
    maxOutputTokens: 1024,
    topP: 0.95,
    topK: 40,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request
  const response = await predictionServiceClient.predict(request);
//   console.log('Get text prompt response');
//   console.log(response);
  return response[0].predictions[0]
}