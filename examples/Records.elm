type alias Test = {
  a: Int,
  b: Int
}

b : Test
b = { a = 1, b = 2 }

b

origin : { x : Float, y : Float }
origin =
  { x = 0
  , y = 0
  }

origin

{ foo = [ 'a', 'b', 'c' ]
, bar = "abc"
}
