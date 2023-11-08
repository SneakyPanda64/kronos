import { Tab } from './interfaces';

export default function TabButton(props: {
  tab: Tab;
  key: number;
  selectedTab: number;
  setSelectedTab: any;
  favicons: any;
  handleTab: any;
  handleDeleteTab: any;
}) {
  return (
    <div className="p-6 px-2" key={props.key}>
      <div>
        <button
          className={
            `p-2  ` +
            (props.tab.id === props.selectedTab ? 'bg-blue-500' : 'bg-red-300')
          }
          onClick={() => props.handleTab(props.tab.id)}
        >
          <h1>{props.tab.title.split('').slice(0, 15).join('')}</h1>
          <h2>{props.favicons[`${props.tab.id}`]}</h2>
        </button>
        <button
          className="bg-black text-red-500"
          onClick={() => props.handleDeleteTab(props.tab.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
