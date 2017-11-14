module Component.UnknownType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : x -> Html a
render v =
    span [ class "comp_unknown" ]
         [ text "No renderer."
         , span [ class "comp_unknown_stringified" ] [ text (toString v) ]
         ]
