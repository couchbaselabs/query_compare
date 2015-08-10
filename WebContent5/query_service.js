angular.module('QueryService').factory('QueryService',
    function ($q) {

  var QueryService = {};

  //
  // this structure holds the current query text, the current query result,
  // and defines the object for holding the query history
  //

  function Query(query,result, num, explain, title) {
    this.query = query;
    this.result = result;
    this.num = num;
    this.explain = explain;
    this.title = title;
  };

  Query.prototype.copyIn = function(other)
  {
    this.result = other.result;
    this.query = other.query;
    this.num = other.num;
    this.explain = other.explain;
    this.title = other.title;
                                       
  };


  var queries = 
    [
     new Query('SELECT * \nFROM   customer \nWHERE  firstName LIKE "A%"\n       AND state LIKE "KY"',
               'SELECT * \nFROM   customer \nWHERE  firstName LIKE "A%"\n       AND state LIKE "KY"',
               '1', 'Get Customers whose name begins with "A" and who live in Kentucky', 'QUERY WITH FILTERS'),

     new Query('SELECT * \nFROM   customer \nWHERE  firstName LIKE "A%"\n       ORDER BY lastName DESC',
               'SELECT * \nFROM   customer \nWHERE  firstName LIKE "A%"\n       ORDER BY lastName DESC',
               '2', 'Get customers whose name begins with "A" and orders them in descending order by last name','QUERY WITH SORTING'),

     new Query('SELECT DISTINCT ( id )\nFROM   orders',
               'SELECT DISTINCT ( id )\nFROM   orders',
               '3', 'Get the distinct items ordered','QUERY WITH DISTINCT'),

     new Query('SELECT *\nFROM   purchases\nWHERE  purchasedAt > “2014-02-02 00:00:00”',
               'SELECT *\nFROM   purchases\nWHERE  MILLIS (purchasedAt) > MILLIS ("2014-02-02 00:00:00")',
               '4', 'Get orders placed after February 2nd, 2014','QUERY WITH DATETIME DATA'),

     new Query('SELECT *\nFROM   purchases\nWHERE  purchasedAt < Now ()',
               'SELECT *\nFROM   purchases\nWHERE  MILLIS ( purchasedAt ) < NOW_MILLIS()',
               '5', 'Get all the orders due for shipping','QUERY WITH DATETIME DATA'),

     new Query('SELECT     * \nFROM       purchases p\nINNER JOIN customer c \nON       c.customerid = p.customerid ',
               'SELECT     * \nFROM       purchases p\nINNER JOIN customer c \nON KEYS    p.customerid ', '6', 'Get the customer id, name, address, purchase date, and item id, and item descriptions for all orders','JOINING KEY SPACES'),

     /*new Query('SELECT o.user_id, u.name, u.address, o.purchase_dt, i.item_id, i.desc\nON o.cust_id = c.cust_id\nFROM orders o JOIN items i\nON o.item_id = i.item_id',
               'SELECT o.user_id, u.name, u.address, o.purchase_dt, i.item_id, i.desc\nON KEYS o.cust_id\nFROM orders o JOIN items i\nON KEYS o._item_id', '7', 'Get the customer id, name, address, purchase date, and item id, and item descriptions for all orders','JOINING KEY SPACES'),*/

     new Query('EXPLAIN\nSELECT *\nFROM   customer\nWHERE  firstName LIKE "Heath%"',
               'EXPLAIN\nSELECT *\nFROM   customer\nWHERE  firstName LIKE "Heath%"',
               '7', 'Get the explain plan for the query getting all customers whose name begins with "Heath"','QUERY PLAN'),

	new Query('SELECT     c.phoneNumber,\n           (min(p.purchasedAt)),\n           (max(p.purchasedAt))\nFROM       purchases p\nINNER JOIN customer c = p.customerId\nGROUP BY   c.phoneNumber',
              	  'SELECT     c.phoneNumber,\n           MILLIS_TO_STR(min(MILLIS(p.purchasedAt))),\n           MILLIS_TO_STR(max(MILLIS(p.purchasedAt)))\nFROM       purchases p INNER JOIN customer c ON KEYS p.customerId\nGROUP BY   c.phoneNumber',
              
            '8', 'Get the customer phone number and ID between all the orders','QUERY WITH GROUPING AND SORTING'),

	new Query('SELECT lastName, firstName \nFROM \n( SELECT phoneNumber, lastName, firstName \nFROM customer WHERE State = "AE" ) AS EmployeeDerivedTable \nWHERE LastName = "Nadar" \nORDER BY firstName',
		  'SELECT lastName, firstName \nFROM \n( SELECT phoneNumber, lastName, firstName \nFROM customer WHERE State = "AE" ) AS EmployeeDerivedTable \nWHERE LastName = "Nadar" \nORDER BY firstName', '9', '','SUBQUERIES'),

	new Query('SELECT DISTINCT e.LastName, e.FirstName, e.BusinessEntityID, sp.Bonus \nFROM Employee AS e \nJOIN SalesPerson AS sp ON e.BusinessEntityID = sp.BusinessEntityID \nWHERE e.Bonus >= \n( SELECT average(sp2.Bonus) \nFROM SalesPerson sp2 \nJOIN Employee AS e2 ON \ne2.BusinessEntityID = sp2.BusinessEntityID \nWHERE e.DepartmentID = e2.DepartmentID )',
                  'SELECT DISTINCT e.LastName, e.FirstName, e.BusinessEntityID, sp.Bonus \nFROM Employee AS e \nJOIN SalesPerson AS sp ON PRIMARY KEYS e.BusinessEntityID \nWHERE e.Bonus >=  \n( SELECT avg(sp2.Bonus) \nFROM Employee AS e2 \nJOIN SalesPerson sp2 ON PRIMARY KEYS \ne2.BusinessEntityID \nWHERE e.DepartmentID = e2.DepartmentID )', '10', '','CORRELATED SUBQUERIES WITH JOIN'),

	new Query('SELECT * \nFROM   purchases p\n WHERE  p.customerId IN(\n       SELECT *\n       FROM   customer c\n       WHERE c.state = "NJ"\n       UNION ALL\n       SELECT *\n       FROM   customer c\n       WHERE  (c.dateAdded) > ("5/6/2013 15:52:14 AM ))',
                  'SELECT * \nFROM   purchases p\n WHERE  p.customerId IN(\n       SELECT *\n       FROM   customer c\n       WHERE c.state = "NJ"\n       UNION ALL\n       SELECT *\n       FROM   customer c\n       WHERE  MILLIS(c.dateAdded) > STR_TO_MILLIS("2013-05-06T15:52:14Z"))',
              '11', '','QUERY WITH UNION'),

	new Query('SELECT     c.customerId,\n           c.phone,\n           COUNT(p.purchaseId) AS totalpurchases\nFROM       purchases p\nINNER JOIN customer c  = p.customerId\nWHERE      (p.purchasedAt) > ("1/1/2014 15:52:14 AM")\nAND        ("12/31/2014 15:52:14 AM")\nGROUP BY   c.customerId,           c.phone\nORDER BY    COUNT(p.purchaseId) DESC',
                  'SELECT     c.customerId,\n           c.phone,\n           COUNT(p.purchaseId) AS totalpurchases\nFROM       purchases p\nINNER JOIN customer c  ON KEYS p.customerId\nWHERE      MILLIS(p.purchasedAt) BETWEEN MILLIS("2014-01-01T15:52:14Z")\n AND        MILLIS("2014-12-31T15:52:14Z"\nGROUP BY   c.customerId,          c.phone ORDER BY COUNT(p.purchaseId)\nDESC',
              '12', '','QUERY FOR PAGENATION'),

     ];

  // current slide
  var index = 0;
  var lastResult = new Query('empty','query');
  lastResult.copyIn(queries[index]);
  QueryService.getResult = function() {return lastResult;};
                                       
  // next slide
  var nextResult = new Query('empty','query');
  nextResult.copyIn(queries[index+1]);
  QueryService.getNext = function() {return nextResult;};
                                       
  // previous slide
  var prevResult = new Query('empty','query');
  prevResult.copyIn(queries[queries.length-1]);
  QueryService.getPrev = function() {return prevResult;};

  //
  // move backward and forward through the array
  //

  QueryService.prevQuery = function()
  {
    index--;
    if (index < 0) 
      index = queries.length-1;
    lastResult.copyIn(queries[index]);
                                       
    if(index == queries.length - 1)
        nextResult.copyIn(queries[0]);
    else
        nextResult.copyIn(queries[index+1]);
                                       
    if(index == 0)
        prevResult.copyIn(queries[queries.length-1]);
    else
        prevResult.copyIn(queries[index-1]);
  }

  QueryService.nextQuery = function()
  {
    index++;
    if (index >= queries.length)
      index = 0;

    lastResult.copyIn(queries[index]);
    if(index == queries.length - 1)
        nextResult.copyIn(queries[0]);
    else
        nextResult.copyIn(queries[index+1]);
                                       
    if(index == 0)
        prevResult.copyIn(queries[queries.length-1]);
    else
        prevResult.copyIn(queries[index-1]);
  }


  return QueryService;
});