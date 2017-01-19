import './<%= compNameHyph %>.less';

class <%= compNameU %>Ctrl {
  static $inject = [];
  constructor() {
  }
}

const <%= compNameComp %> = {
  template: require('./<%= compNameHyph %>.pug')(),
  bindings: <{[binding: string]: string}> {
  },
  controller: <%=compNameU%>Ctrl,
  obName: 'ob<%= compNameU %>'
};

export default <%= compNameComp %>;
