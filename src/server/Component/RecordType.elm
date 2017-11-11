module Component.RecordType exposing (render)

import Array exposing (Array)
import Html exposing (..)
import Html.Attributes exposing (class)


render : Array String -> (Int -> Html a) -> Html a
render fields fieldRenderer =
    div [ class "comp_record" ]
        (fields
            |> Array.indexedMap
                (\index fieldName ->
                    renderField fieldName (fieldRenderer index))
            |> Array.toList)


renderField : String -> Html a -> Html a
renderField fieldName renderedValue =
    div [ class "comp_record_field" ]
        [ div [ class "comp_record_field_name" ] [ text fieldName ]
        , div [ class "comp_record_field_value" ] [ renderedValue ]
        ]
