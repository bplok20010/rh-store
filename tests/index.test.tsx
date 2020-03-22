import { mount, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { createStore, Provider } from "../src";
import React from "react";

configure({ adapter: new Adapter() });

test("createStore", () => {
	const context = createStore({});

	expect(Object.keys(context)).toHaveLength(6);

	expect(Object.keys(context)).toEqual([
		"Provider",
		"Consumer",
		"useProvider",
		"useState",
		"useSelector",
		"useUpdate",
	]);
});

test("render Provider -1", () => {
	const data = {
		name: "provider",
	};
	const Context = createStore(data);

	const ref = React.createRef<Provider<typeof data>>();

	mount(<Context.Provider ref={ref} />);

	expect(ref.current.state).toEqual({ name: "provider" });
});

test("render Provider with child update", () => {
	const data = {
		name: "provider",
	};
	const Context = createStore(data);

	const ref = React.createRef<RootComponent>();

	let counter = 0;

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return null;
		}
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Context.Provider>
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	mount(<RootComponent ref={ref} />);

	ref.current.setState({}, () => {
		expect(counter).toEqual(2);
	});
});

test("render Provider without child update", () => {
	const data = {
		name: "provider",
	};

	const ref = React.createRef<Provider<typeof data>>();

	const Context = createStore(data);

	let counter = 0;

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return null;
		}
	}

	class RootComponent extends React.Component {
		providerRef = React.createRef<Provider<typeof data>>();

		componentDidMount() {}
		render() {
			return (
				<Context.Provider ref={ref}>
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	mount(<RootComponent />);

	ref.current.setState({ name: "update" }, () => {
		expect([counter, ref.current.state]).toEqual([1, { name: "update" }]);
	});
});

test("useState&useUpdate", () => {
	const data = {
		value: "a",
	};

	let counter = 0;

	const Context = createStore(data);

	function Button() {
		counter++;
		const update = Context.useUpdate();
		return (
			<button
				onClick={() => {
					update({
						value: "b",
					});
				}}
			>
				Count
			</button>
		);
	}

	function Consumer() {
		const state = Context.useState();
		return <div className="consumer">{state.value}</div>;
	}

	class MyComponent extends React.Component {
		componentDidMount() {
			counter++;
		}
		componentDidUpdate() {
			this.componentDidMount();
		}
		render() {
			return <Consumer />;
		}
	}

	class Action extends React.Component {
		render() {
			return (
				<div>
					<Button />
				</div>
			);
		}
	}

	class RootComponent extends React.Component {
		render() {
			return (
				<Context.Provider>
					<Action />
					<MyComponent />
				</Context.Provider>
			);
		}
	}

	const wrapper = mount(<RootComponent />);

	expect(counter).toEqual(2);
	expect(wrapper.find(".consumer").text()).toEqual("a");

	wrapper.find("button").simulate("click");

	expect(counter).toEqual(2);
	expect(wrapper.find(".consumer").text()).toEqual("b");
});