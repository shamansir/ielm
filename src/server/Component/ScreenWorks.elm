module Screen0_v8 exposing (..)


import Html exposing (..)
import Prelude exposing (..)

import Html


import Component.Cell as Cell
import Component.TypeType exposing (TypeAtom(..))

import Component.HtmlType as HtmlType
import Component.HtmlType as HtmlType
import Component.StringType as StringType
import Component.StringType as StringType
import Component.StringCompatibleType as StringCompatibleType

type alias CellId = Int

type alias Action = Cell.Action

type alias Model =
    { currentCell: CellId
    , inputs: Cell.Inputs
    , time: Cell.Time
    , position: Mouse.Position 0 0
    }

type alias Flags = CellId

useInputsIFI : Inputs -> (Int -> Float -> Int -> a) -> a
useInputsIFI inputs f a1 a2 a3 =
    case inputs of
        [ IInteger i1, IFloat i2, IInteger i3 ] -> f i1 i2 i3
        _ -> f 0 0.0 0

view : Model -> Html Action
view { currentCell, inputs, time } =
    case currentCell of
        0 -> t_cell_0_0
        1 -> t_cell_0_1 (inputs |> Maybe.withDefault Array.empty)
        2 -> t_cell_0_2 time
        3 -> t_cell_0_3
        4 -> t_cell_0_4
        _ -> div [] [ text "Unknown cell type" ]

-- Html Cell.Action
t_cell_0_0 =
    cell_0_0 |> Cell.renderBasic
        HtmlType.render
        (MessageAlias "Html" "msg")

t_cell_0_1 inputs =
    cell_0_1 |> useInputsIFI inputs |> Cell.renderControllable
        HtmlType.render
        (MessageAlias "Html" "msg")
        inputs

t_cell_0_2 time =
    (cell_0_2 time) |> Cell.renderAt
        StringType.render
        (Name "String")
        time

t_cell_0_3 =
    cell_0_3 |> Cell.renderBasic
        StringType.render
        (Name "String")

t_cell_0_4 =
    cell_0_4 |> Cell.renderBasic
        StringCompatibleType.render
        (Variable "number")

getInputs : CellId -> Maybe Inputs
getInputs cellId
    case currentCell of
        1 -> Array.fromList [ IInteger 5, IText "test", IFloat 2.3 ]
        _ -> []

init : Flags -> ( Model, Cmd Action )
init cellId =
    { currentCell = cellId
    , inputs = getInputs cellId
    , time = 0
    } ! []

update : Action -> Model -> (Model, Cmd Action)
update action model
    = case action of
        UpdateInput index input_ ->
            { model | inputs = model.inputs |> Array.set index input_ } ! []
        NewFrame time ->
            { model | time = time }
        MouseMove position ->
            { model | position = position }

-- Program Model Model Cell.Action
main =
    programWithFlags
        { init = init
        , update = update
        , subscriptions = \_ -> Sub.none {-- has 3D? --}
        , view = view
        }

