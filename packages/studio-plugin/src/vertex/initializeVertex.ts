/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = 'studio-buddy-395317';
const location = 'us-central1';

import {EndpointServiceClient} from '@google-cloud/aiplatform';

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};
const client = new EndpointServiceClient(clientOptions);

export async function listEndpoints() {
  // Configure the parent resource
  const parent = `projects/${projectId}/locations/${location}`;
  const request = {
    parent,
  };

  // Get and print out a list of all the endpoints for this resource
  const [result] = await client.listEndpoints(request);
  for (const endpoint of result) {
    console.log(`\nEndpoint name: ${endpoint.name}`);
    console.log(`Display name: ${endpoint.displayName}`);
    if (endpoint.deployedModels ? endpoint.deployedModels[0] : "") {
      console.log(
        `First deployed model: ${endpoint.deployedModels ? endpoint.deployedModels[0].model : ""}`
      );
    }
  }
}
