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
  constructor(props ) {
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
    const res = await this.props.getTextGeneration(message.data.text);
    console.log(res)
    this.sendMessage(`Great! I've made the change.`);
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