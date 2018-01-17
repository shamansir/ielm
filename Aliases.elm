import List

type alias Foo = List Int

bar : Foo
bar = [ 2, 3, 4 ]

bar

type alias Test = {
  a: Int,
  b: Int
}

foo : Test
foo = { a = 1, b = 2 }

foo
