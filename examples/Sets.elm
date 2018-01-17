import Set

type alias Foo = Set.Set Int

bar : Foo
bar = Set.fromList [ 2, 3, 4, 4, 2 ]

bar
