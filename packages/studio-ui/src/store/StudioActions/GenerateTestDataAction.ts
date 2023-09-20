import {
  STREAM_LOCALIZATION,
  StreamScope,
  EntityFeature,
  StaticFeature,
  FeaturesJson,
  MessageID,
  ResponseEventMap,
} from "@yext/studio-plugin";
import { Stream } from "@yext/pages";
import PageSlice from "../models/slices/PageSlice";
import sendMessage from "../../messaging/sendMessage";
import isEqual from "lodash/isEqual";
import StudioActions from "../StudioActions";

export default class GenerateTestDataAction {
  constructor(
    private getPageSlice: () => PageSlice,
    private studioActions: StudioActions
  ) {}

  generateTestData = async (): Promise<
    ResponseEventMap["studio:generateTestData"]
  > => {
    const featuresJson = Object.entries(
      this.getPageSlice().pages
    ).reduce<FeaturesJson>(
      (json, pageEntry) => {
        const [pageName, pageState] = pageEntry;
        const scope = pageState.pagesJS?.streamScope;
        if (scope) {
          const entityFeature =
            GenerateTestDataAction.getEntityFeature(pageName);
          const stream = GenerateTestDataAction.getStreamFromStreamScope(
            scope,
            pageName
          );
          json.features.push(entityFeature);
          json.streams.push(stream);
        } else {
          const staticFeature =
            GenerateTestDataAction.getStaticFeature(pageName);
          json.features.push(staticFeature);
        }
        return json;
      },
      {
        streams: [],
        features: [],
      }
    );
    const response = await sendMessage(MessageID.GenerateTestData, {
      featuresJson,
    });
    await this.updateEntityFiles(response.mappingJson);
    return response;
  };

  private updateEntityFiles = async (mappingJson: Record<string, string[]>) => {
    await Promise.all(
      Object.entries(this.getPageSlice().pages).map(
        async ([pageName, pageState]) => {
          const entityFiles: string[] = mappingJson[pageName];
          const newEntityFilesSet = new Set(entityFiles);
          const currEntityFilesSet = new Set(pageState.pagesJS?.entityFiles);
          if (!isEqual(currEntityFilesSet, newEntityFilesSet)) {
            this.getPageSlice().setEntityFiles(pageName, entityFiles);
            if (pageName === this.getPageSlice().activePageName) {
              await this.studioActions.refreshActivePageEntities();
              this.getPageSlice().setActiveEntityFile(entityFiles?.[0]);
            }
          }
        }
      )
    );
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

  private static getStaticFeature(pageName: string): StaticFeature {
    return {
      name: pageName,
      templateType: "JS",
      staticPage: {},
    };
  }
}
