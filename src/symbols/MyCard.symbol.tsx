import Banner from '../components/Banner';
import Card from '../components/Card';

export default function MyCard () {
  return (
    <Card text='this is a card inside a symbol'>
      <Banner/>
      <Card text='this is the child card inside the symbol card'/>
    </Card>
  )
}