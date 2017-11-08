module Component.ListType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : (x -> Html a) -> List x -> Html a
render itemTypeRenderer list =
    div [ class "comp_list" ]
        [ list
          |> List.map (renderItem itemTypeRenderer)
          |> div [ class "comp_list_items" ]
        ]

renderItem : (x -> Html a) -> x -> Html a
renderItem itemTypeRenderer item =
    div [ class "comp_list_item" ] [ itemTypeRenderer item ]
