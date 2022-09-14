export const testTree = [
  {
    "id": "1908bd51-916c-49ac-b62a-eceef4de65a7",
    "parent": "tree-root-uuid",
    "text": "Banner",
    "droppable": true,
    "data": {
      "moduleName": "localComponents",
      "props": {
        "randomNum": {
          "type": "number",
          "value": 100
        },
        "streamData": {
          "type": "StreamsData",
          "value": "document.address.city",
          "expressionSource": "Unknown"
        },
        "subtitleUsingStreams": {
          "type": "StreamsString",
          "value": "document.id",
          "expressionSource": "Unknown"
        },
        "title": {
          "type": "string",
          "value": "siteSettings.experienceKey",
          "expressionSource": "siteSettings"
        },
        "backgroundColor": {
          "type": "HexColor",
          "value": "#b75c5c"
        },
        "someBool": {
          "type": "boolean",
          "value": true
        },
        "anotherColor": {
          "type": "HexColor",
          "value": "#45de0d"
        }
      },
      "name": "Banner",
      "uuid": "1908bd51-916c-49ac-b62a-eceef4de65a7"
    }
  },
  {
    "id": "299076f1-86cf-400d-8c2c-1b845ea60321",
    "parent": "tree-root-uuid",
    "text": "Banner",
    "droppable": true,
    "data": {
      "moduleName": "localComponents",
      "props": {
        "title": {
          "type": "string",
          "value": "custom title"
        },
        "randomNum": {
          "type": "number",
          "value": 1
        },
        "streamData": {
          "type": "StreamsData",
          "value": "document.emails[1]",
          "expressionSource": "Unknown"
        },
        "subtitleUsingStreams": {
          "type": "StreamsString",
          "value": "`${document.lastName}`",
          "expressionSource": "Unknown"
        },
        "someBool": {
          "type": "boolean",
          "value": true
        },
        "anotherColor": {
          "type": "HexColor",
          "value": "#9c8181"
        }
      },
      "name": "Banner",
      "uuid": "299076f1-86cf-400d-8c2c-1b845ea60321"
    }
  }
]