module Component.RecordType exposing (render)

import Dict as Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (class)


render : Dict String (z -> Html a) -> Dict String z -> x -> Html a
render fieldRenderers values record =
    div [ class "comp_record" ]
        (fieldRenderers
          |> Dict.map
            (\fieldName fieldRenderer ->
                renderField fieldName fieldRenderer (values |> Dict.get fieldName))
          |> Dict.values)


renderField : String -> (x -> Html a) -> Maybe x -> Html a
renderField fieldName fieldRenderer maybeValue =
    case maybeValue of
        Just value ->
            div [ class "comp_record_field" ]
                [ div [ class "comp_record_field_name" ] [ text fieldName ]
                , div [ class "comp_record_field_value" ] [ fieldRenderer value ]
                ]
        Nothing -> span [ class "comp_record_no_value" ] [ text "Value is missing" ]
