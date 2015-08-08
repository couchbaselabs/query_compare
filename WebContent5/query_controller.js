angular.module('Query').controller('QueryController',
    function ($scope, $modal, QueryService) {


  //
  // structure for holding the current query and result
  //    

  $scope.lastResult = QueryService.getResult();
  $scope.nextResult = QueryService.getNext();
  $scope.prevResult = QueryService.getPrev();

  //
  // options for the two editors, query and result
  //

  $scope.queryEditorOptions = {
      mode: 'text/x-sql',
      readOnly: 'cursor',
      lineNumbers: true,
      indentWithTabs: true,
      smartIndent: true,
      autofocus: true,
      height: 'auto',
      viewportMargin: Infinity,
      extraKeys: {"Ctrl-Space": "autocomplete"},
      hintOptions: {
        tables: {
          'beer-sample': { }
        }
      },
      onLoad: function(_editor) {
        _editor.setSize(535, 240);
        _editor.setValue(QueryService.getResult().query);
        _editor.execCommand("selectAll");
      }
  };

  $scope.resultsEditorOptions = {
      readOnly: 'cursor',
      lineNumbers: true,
      height: 'auto',
      viewportMargin: Infinity,
      mode: 'text/x-n1ql',
      onLoad: function(_editor) {
        _editor.setSize(535,240);
        _editor.setValue(QueryService.getResult().result);
      }
  };


  //
  // some functions for handling query history, going backward and forward
  //

  $scope.prev = QueryService.prevQuery;
  $scope.next = QueryService.nextQuery;


});
