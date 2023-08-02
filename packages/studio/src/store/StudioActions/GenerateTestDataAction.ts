import {
  STREAM_LOCALIZATION,
  StreamScope,
  EntityFeature,
  FeaturesJson,
  MessageID,
} from "@yext/studio-plugin";
import { Stream } from "@yext/pages";
import PageSlice from "../models/slices/PageSlice";
import sendMessage from "../../messaging/sendMessage";
import { toast } from "react-toastify";

export default class GenerateTestDataAction {
  constructor(private getPageSlice: () => PageSlice) {}

  generateTestData = async (): Promise<Record<string, string[]>> => {
    const featuresJson = Object.entries(
      this.getPageSlice().pages
    ).reduce<FeaturesJson>(
      (json, pageEntry) => {
        const [pageName, pageState] = pageEntry;
        const scope = pageState.pagesJS?.streamScope;
        if (!scope) {
          return json;
        }
        const entityFeature = GenerateTestDataAction.getEntityFeature(pageName);
        const stream = GenerateTestDataAction.getStreamFromStreamScope(
          scope,
          pageName
        );
        json.features.push(entityFeature);
        json.streams.push(stream);
        return json;
      },
      {
        streams: [],
        features: [],
      }
    );
    try {
      const response = await sendMessage(
        MessageID.GenerateTestData,
        {
          featuresJson,
        },
        {
          displayErrorToast: false,
        }
      );
      return response.mappingJson;
    } catch {
      toast.warn("Could not generate test data, but page was still created.");
      return {};
    }
  };

  private static getStreamId(pageName: string) {
    return `studio-stream-id-${pageName}`;
  }

  private static getStreamFromStreamScope(
    streamScope: StreamScope,
    pageName: string
  ): Stream {
    return {
      $id: this.getStreamId(pageName),
      localization: STREAM_LOCALIZATION,
      filter: streamScope,
      // We will be requesting all fields with the `-a` flag.
      fields: ["meta"],
    };
  }

  private static getEntityFeature(pageName: string): EntityFeature {
    return {
      name: pageName,
      streamId: this.getStreamId(pageName),
      templateType: "JS",
      entityPageSet: {},
    };
  }
}
