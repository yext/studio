import { Component } from 'react'
import { Launcher } from 'react-chat-window'

const AGENT_PROFILE = {
  teamName: 'studio buddy',
  imageUrl: 'https://i.imgur.com/6aHM1CZ.png'
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

export default class ChatBot extends Component<object, ChatState>{
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      isOpen: false,
    };
  }

  componentDidMount(): void {
    this.sendMessage("welcome to studio", "us");
  }

  onMessageWasSent = (message: Message) => {
    this.setState({
      messageList: [...this.state.messageList, message]
    })
    this.sendMessage("recieved, thanks. sit tight.", "us")
  }

  sendMessage(text: string, author: string) {
    if (text.length > 0) {
      this.setState({
        messageList: [...this.state.messageList, {
          author: author,
          type: 'text',
          data: { text }
        }]
      })
    }
  }

  handleClick = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
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