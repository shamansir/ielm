module Component.Cell exposing (render)

import Component.TypeType as T

import Html exposing (..)
import Html.Attributes exposing (..)

render : (a -> Html msg) -> T.TypeAtom -> a -> Html msg
render valueRenderer atom value =
    div [ class "cell" ]
        [ [ T.render atom ] |> div [ class "cell_type" ]
        , [ valueRenderer value ] |> div [ class "cell_value" ]
        ]
