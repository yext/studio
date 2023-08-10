import { Component } from 'react'
import { Launcher } from 'react-chat-window'

const AGENT_PROFILE = {
  teamName: 'studio buddy',
  imageUrl: 'https://i.imgur.com/7HDt2AH.png'
}

type Message = {
  author: string;
  type: string;
  data: MessageData
};
type MessageData = {
  text: string;
};
interface ChatState {
  messageList: Message[];
  isOpen: boolean;
};

export default class ChatBot extends Component<{getTextGeneration: Function, getCodeCompletion: Function, writeFile: Function, getAllComponentFilepaths: Function, getComponentFile: Function}, ChatState>{
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      isOpen: false,
    };
  }


  componentDidMount(): void {
    this.sendMessage("Welcome to Studio! What changes can I help you with?");
  }

  onMessageWasSent = (message: Message) => {
    this.setState({
      messageList: [...this.state.messageList, message]
    }, () => this.answerMessage(message));
  }

  answerMessage = async (message: Message) => {

    const filepaths = await this.props.getAllComponentFilepaths()
  
    console.log("filepaths", filepaths)
  
    const fileSelector = await this.props.getTextGeneration("Which filepath does this message want to edit:" + message.data.text + ". The only possible filepaths are: " + filepaths.filepaths.join("\n") + ". ONLY respond with the filename.")

    console.log("chosen file", fileSelector, message.data.text)

    const modifiedPromptRes = await this.props.getTextGeneration("select the text of what the user wants to change in this sentence \"" + message.data.text + "\" and add it to the end of this sentence: \"Edit the typescript code below to  \"")
    console.log(modifiedPromptRes)
    const re = new RegExp("^(Edit the typescript code below to)(.)*");
    console.log("here", modifiedPromptRes.file.match(re))
    let editTheCode = modifiedPromptRes.file.match(re)[0]
    //
    console.log("TextBison output", modifiedPromptRes, editTheCode)

    const originalFile = await this.props.getComponentFile(fileSelector.file)

    console.log("original file", originalFile)

    console.log("code bison input", editTheCode + originalFile.file)
    const optionalPropRegex = new RegExp(/(option)|(prop)/, "gm");
    editTheCode = editTheCode.replaceAll(optionalPropRegex, "optional prop");

    const newFileRes = await this.props.getCodeCompletion(editTheCode + originalFile.file)

    console.log("code bison output", newFileRes.file.slice(3).slice(0, -3))

    const writeRes = await this.props.writeFile(fileSelector.file, newFileRes.file.slice(13).slice(0, -3))

    console.log("write file output", writeRes)

    this.sendMessage(`Great! I've made the change.`);
    window.location.reload()
  }

  sendMessage(text: string) {
    if (text.length > 0) {
      this.setState({
        messageList: [...this.state.messageList, {
          author: 'them',
          type: 'text',
          data: { text }
        }]
      });
    }
  }

  handleClick = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    console.log(this.state.messageList);
    return (<div>
      <Launcher
        agentProfile={AGENT_PROFILE}
        onMessageWasSent={this.onMessageWasSent}
        messageList={this.state.messageList}
        handleClick={this.handleClick}
        isOpen={this.state.isOpen}
        showEmoji
      />
    </div>)
  }
}