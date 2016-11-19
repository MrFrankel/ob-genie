class <%= compNameU %>Ctrl {
  static $inject = [];
  constructor() {
  }
}

const <%= compNameComp %> = {
  templateUrl: [
    'TemplateBasePath', TemplateBasePath =>
      TemplateBasePath + '<%= path %>/<%= compNameL %>/<%= compNameL %>.html'
  ],
  bindings: <{[binding: string]: string}> {
  },
  controller: <%=compNameU%>Ctrl,
  obName: 'ob<%= compNameU %>'
};

export default <%= compNameComp %>;
