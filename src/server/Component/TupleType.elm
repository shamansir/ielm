module Component.TupleType exposing
    ( render2
    , render3
    )


import Html exposing (..)
import Html.Attributes exposing (class)


render2 : ( (b -> Html a), (c -> Html a) ) -> ( b, c ) -> Html a
render2 ( item1Renderer, item2Renderer ) ( item1, item2 ) =
    div [ class "comp_tuple" ]
        [ div
            [ class "comp_tuple_items" ]
            [ item1 |> renderItem item1Renderer
            , item2 |> renderItem item2Renderer
            ]
        ]


render3 : ( (b -> Html a), (c -> Html a), (d -> Html a) ) -> ( b, c, d ) -> Html a
render3 ( item1Renderer, item2Renderer, item3Renderer ) ( item1, item2, item3 ) =
    div [ class "comp_tuple" ]
        [ div
            [ class "comp_tuple_items" ]
            [ item1 |> renderItem item1Renderer
            , item2 |> renderItem item2Renderer
            , item3 |> renderItem item3Renderer
            ]
        ]


renderItem : (x -> Html a) -> x -> Html a
renderItem itemTypeRenderer item =
    div [ class "comp_tuple_item" ] [ itemTypeRenderer item ]
