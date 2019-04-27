import { React, ReactDOM } from 'https://unpkg.com/es-react@16.8.30';

  import htm from 'https://unpkg.com/htm?module'
  const html = htm.bind(React.createElement)

  function appReducer(state, action) {
    switch (action.type) {
      case 'reset': {
        return action.payload;
      }
      case 'add': {
        return [
          ...state,
          {
            id: Date.now(),
            text: '',
            completed: false
          },
        ];
      }
      case 'delete': {
        return state.filter(item => item.id !== action.payload);
      }
      case 'completed': {
        return state.map(item => {
          if (item.id === action.payload.id) {
            return {
              ...item,
              completed: !item.completed,
            };
          }
          return item;
        })
      }
      case 'typed': {
        return state.map(item => {
          if (item.id === action.payload.id) {
            return {
              ...item,
              text: action.payload.text,
            };
          }
          return item;
        })
      }
      default: {
        return state;
      }
    }
  }

  const Counter = props => {

    const [count, setCount] = React.useState(parseInt(props.count))

    return html`
      <div>
        <h1>Counter app</h1>
        <h3>${count}</h3>
        <button onClick=${e => setCount(count - 1)}>Decrement</button>
        <button onClick=${e => setCount(count + 1)}>Increment</button>
      </div>
    `
  }


  const Context = React.createContext();
  //Context API - provide value or data to any child

  const TodoApp = () => {

    const [state, dispatch] = React.useReducer(appReducer, []);
    //useReducer - help manage large, complex data

    const didRun = React.useRef(false);
    //useRef

    React.useEffect(() => {
      if (!didRun.current) {
        const raw = localStorage.getItem('data');
        dispatch({ type: 'reset', payload: JSON.parse(raw)});
        didRun.current = true;
      }
    });
    //useEffect - manage side effects and save to local storage

    // React.useEffect(() => {
    //   const raw = localStorage.getItem('data');
    //   dispatch({ type: 'reset', payload: JSON.parse(raw)});
    // }, []);
    // alternative to above - empty array will only run this effect once!

    React.useEffect(() => {
      localStorage.setItem('data', JSON.stringify(state));
    }, [state]);

    if (state.length > 0) {
      return html`
        <${Context.Provider} value=${dispatch}>
          <h1>Todo app</h1>
          <button onClick=${e => dispatch({ type: 'add' })}>New Todo</button>

          <${TodoList} items=${state} />
        </${Context.Provider}>
      `
    } else {
      return null;
    }
  }

  function TodoList( { items }) {
    if (items) {
      return html`
        <ul>
          ${items.map(item => html`<${TodoItem} key=${item.id} item=${item} />`)}
        </ul>
      `
    } else {
      return null
    }
  }

  function TodoItem( { item }) {

    const dispatch = React.useContext(Context);
    //useContext - hook to retrieve values stored in Context

    const handleChangeInput = e => {
      let textInput = e.target.value;
      dispatch({
        type: 'typed',
        payload: {...item, text: textInput},
      });
    };

    return html`
      <li key=${item.id}>
        <input type='checkbox' checked=${item.completed} onChange=${() => dispatch({ type: 'completed', payload: item})} />
        <input type='text' value=${item.text}  onChange=${handleChangeInput} />
        <button onClick=${() => dispatch({ type: 'delete', payload: item.id})}>Delete</button>
      </li>
    `
  }


  ReactDOM.render(
    html`
      <p>no scripts, no build steps - react, htm</p>
      <${Counter} count=0 />
      <br />
      <br />
      <${TodoApp} />
    `,
    document.getElementById('app')
  )
