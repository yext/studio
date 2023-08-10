const project = 'studio-buddy-395317';
import aiplatform, {helpers} from '@google-cloud/aiplatform'

// Imports the Google Cloud Prediction service client
const {PredictionServiceClient} = aiplatform.v1;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};
const publisher = 'google';
const model = 'code-bison@001';

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient(clientOptions);

export async function callCodeBison(prompt) {
  // Configure the parent resource
  const endpoint = `projects/${project}/locations/us-central1/publishers/${publisher}/models/${model}`;

  const internalPrompt = {
    prefix: prompt,
  };
  const instanceValue = helpers.toValue(internalPrompt);
  const instances = [instanceValue];

  const parameter = {
    temperature: 0,
    maxOutputTokens: 1024,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request
  const [response] = await predictionServiceClient.predict(request);
  // console.log('Get code generation response');
  const predictions = response.predictions;
  // console.log('\tPredictions :');
  return predictions[0]
  // for (const prediction of predictions) {
  //   console.log(`\t\tPrediction : ${JSON.stringify(prediction.structValue.fields.content.stringValue)}`);
  // }
}
