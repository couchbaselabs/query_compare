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
               'EXPLAIN\nSELECT *\nFROM   customers\nWHERE  firstName LIKE "Heath%"',
               '7', 'Get the explain plan for the query getting all customers whose name begins with "John"','QUERY PLAN'),

	new Query('SELECT l_returnflag, l_linestatus, sum(l_quantity) as sum_qty, sum(l_extendedprice) as sum_base_price, sum(l_extendedprice * (1 - l_discount)) as sum_disc_price, count(*) as count_order\nFROM lineitem \nWHERE l_shipdate <= "1998-12-01" \nGROUP BY l_returnflag, l_linestatus \nORDER BY l_returnflag, l_linestatus',
              
              'select c.phoneNumber, MILLIS_TO_STR(min(MILLIS(p.purchasedAt))), MILLIS_TO_STR(max(MILLIS(p.purchasedAt)))from purchases p inner join customer c on keys p.customerId group by c.phoneNumber',
              
            '8', 'Get the customer key, balance, name, address, phone, country, and total amount purchases per customer between October 1st 1993 and October 1st 1994','QUERY WITH GROUPING AND SORTING'),

	new Query('SELECT LastName, FirstName \nFROM \n( SELECT BusinessEntityID, LastName, FirstName \nFROM Employee WHERE State = "NY" ) AS EmployeeDerivedTable \nWHERE LastName = "Smith" \nORDER BY FirstName',
		  'SELECT LastName, FirstName \nFROM \n( SELECT BusinessEntityID, LastName, FirstName \nFROM Employee WHERE State = "NY" ) AS EmployeeDerivedTable \nWHERE LastName = "Smith" \nORDER BY FirstName', '9', '','SUBQUERIES'),

	new Query('SELECT DISTINCT e.LastName, e.FirstName, e.BusinessEntityID, sp.Bonus \nFROM Employee AS e \nJOIN SalesPerson AS sp ON e.BusinessEntityID = sp.BusinessEntityID \nWHERE e.Bonus >= \n( SELECT average(sp2.Bonus) \nFROM SalesPerson sp2 \nJOIN Employee AS e2 ON \ne2.BusinessEntityID = sp2.BusinessEntityID \nWHERE e.DepartmentID = e2.DepartmentID )',
              'SELECT DISTINCT e.LastName, e.FirstName, e.BusinessEntityID, sp.Bonus \nFROM Employee AS e \nJOIN SalesPerson AS sp ON PRIMARY KEYS e.BusinessEntityID \nWHERE e.Bonus >=  \n( SELECT avg(sp2.Bonus) \nFROM Employee AS e2 \nJOIN SalesPerson sp2 ON PRIMARY KEYS \ne2.BusinessEntityID \nWHERE e.DepartmentID = e2.DepartmentID )', '10', '','CORRELATED SUBQUERIES WITH JOIN'),

	new Query('SELECT * FROM Employee e \nWHERE e.BusinessEntityID IN \n( SELECT BusinessEntityID FROM SalesPerson WHERE Ranking >= 5.0 \nUNION ALL \nSELECT BusinessEntityID FROM CustomerReview WHERE Score >= 8.0 )',
              'select * from purchases p where p.customerId in (select * from customer c where c.state = "NJ" UNION ALL select * from customer c where MILLIS(c.dateAdded) > STR_TO_MILLIS("2013-05-06T15:52:14Z"))',
              '11', '','QUERY WITH UNION'),

	new Query('SELECT c_custkey, c_name, sum(l_extendedprice * (1 - l_discount)) as revenue, c_acctbal, n_name, c_address, c_phone, c_comment \nFROM customer, orders, lineitem, nation \nWHERE \nc_custkey = o_custkey AND l_orderkey = o_orderkey AND o_orderdate >= date "1993-10-01" AND o_orderdate < date "1994-10-01" AND l_returnflag = "R" AND c_nationkey = n_nationkey \nGROUP BY c_custkey, c_name, c_acctbal, c_phone, n_name, c_address, c_comment \nORDER BY revenue desc \nLIMIT 20 OFFSET 100 ',
              
              'select c.customerId, c.phone, count(p.purchaseId) as totalpurchases FROM purchases p INNER JOIN customer c  on keys p.customerId WHERE  MILLIS(p.purchasedAt) between MILLIS("2014-01-01T15:52:14Z") and MILLIS("2014-12-31T15:52:14Z") GROUP BY c.customerId, c.phone ORDER BY COUNT(p.purchaseId) DESC;',
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