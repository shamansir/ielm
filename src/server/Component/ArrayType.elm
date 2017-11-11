module Component.ArrayType exposing (render)

import Array exposing (Array)

import Html exposing (..)
import Html.Attributes exposing (class)

render : (x -> Html a) -> Array x -> Html a
render itemTypeRenderer array =
    div [ class "comp_array" ]
        [ array
          |> Array.map (renderItem itemTypeRenderer)
          |> Array.toList
          |> div [ class "comp_array_items" ]
        ]


renderItem : (x -> Html a) -> x -> Html a
renderItem itemTypeRenderer item =
    div [ class "comp_array_item" ] [ itemTypeRenderer item ]
