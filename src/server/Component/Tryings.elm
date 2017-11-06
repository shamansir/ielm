module Tryings exposing (main)

import Array exposing (Array)
import String
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (on, onInput)

type Input
    = IInteger Int
    | IFloat Float
    | IText String
    -- | AColor String

type alias Model = Array Input

type Msg = NewValue Int Input

render : (a -> Html Msg) -> a -> Html Msg
render valueRenderer value =
    div [ class "cell" ]
        [ [ valueRenderer value ]
          |> div [ class "cell_value" ]
        ]

renderWithInput : Array Input -> (Array Input -> Html Msg) -> Html Msg
renderWithInput inputs valueRenderer =
    div [ class "cell" ]
        [ (Array.indexedMap renderInput inputs)
          |> Array.toList
          |> div [ class "cell_inputs" ]
        , [ valueRenderer inputs ]
          |> div [ class "cell_value" ]
        ]

renderInput : Int -> Input -> Html Msg
renderInput index input_ =
    case input_ of
        IInteger num -> input
            [ type_ "range", step "1", toIntInput index |> onInput ]
            [ toString num |> text ]
        IFloat num -> input
            [ type_ "range", toFloatInput index |> onInput ]
            [ toString num |> text ]
        IText str -> input
            [ type_ "text", toTextInput index |> onInput ]
            [ text str ]

extractVal : Input -> String
extractVal i =
    case i of
        IInteger num -> toString num
        IFloat num -> toString num
        IText str -> str

toIntInput : Int -> String -> Msg
toIntInput index str =
    NewValue index (IInteger (String.toInt str |> Result.withDefault 0))

toFloatInput : Int -> String -> Msg
toFloatInput index str =
    NewValue index (IFloat (String.toFloat str |> Result.withDefault 0.0))

toTextInput : Int -> String -> Msg
toTextInput index str =
    NewValue index (IText str)

useInputs : Array Input -> Html Msg
useInputs inputs =
    inputs
        |> Array.map (\i -> span [] [ text (extractVal i) ])
        |> Array.toList
        |> div [ ]

init : Model
init = Array.fromList [ IInteger 5, IText "test", IFloat 2.3 ]

update : Msg -> Model -> (Model, Cmd Msg)
update msg inputs
    = case msg of
        NewValue index input_ ->
            ( inputs |> Array.set index input_, Cmd.none )

view : Model -> Html Msg
view inputs =
    renderWithInput
        inputs
        useInputs

main =
  program
    { init = ( init, Cmd.none )
    , update = update
    , subscriptions = \_ -> Sub.none
    , view = view
    }


-- type alias Model = {
--     selectedCell: Int,
--     cellModel: Cell.Model
-- }

-- type Msg = UpdateCell Int Cell.Msg
