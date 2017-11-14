module Component.Screen exposing
    ( CellId
    , Flags
    , Model
    , init
    , update
    , subscribe
    , addInputs
    )

import Array
import Mouse

import Component.Cell as Cell
import Component.ThreeDViewer as TDV


type alias CellId = Int


type alias Flags =
    { cellId: CellId
    }


type alias Model =
    { cellId: CellId
    , refPosition: Maybe Mouse.Position
    , position: Maybe Mouse.Position
    , inputs: Maybe Cell.Inputs
    }


init : Flags -> ( Model, Cmd Cell.Action )
init { cellId } =
    { cellId = cellId
    , refPosition = Nothing
    , position = Nothing
    , inputs = Nothing
    } ! []


update : Cell.Action -> Model -> ( Model, Cmd Cell.Action )
update action model =
    case action of
        Cell.MouseMove position ->
            (model |> withAdaptedPosition position) ! []
        Cell.SetRefPosition refPosition ->
            { model | refPosition = Just refPosition } ! []
        Cell.UpdateInput inputId newValue ->
            case model.inputs of
                Just curInputs ->
                    { model | inputs = Just (curInputs |> Array.set inputId newValue) } ! []
                Nothing -> model ! []


withAdaptedPosition : Mouse.Position -> Model -> Model
withAdaptedPosition position model =
    { model | position = TDV.adaptPosition model.refPosition position }


addInputs : List Cell.Input -> ( Model, Cmd Cell.Action ) -> ( Model, Cmd Cell.Action )
addInputs inputsList ( model, cmd ) =
    -- let
    --     inputsList = case cellId of
    --         0 -> [ Cell.IInteger 0, Cell.IInteger 0 ]
    --         1 -> [ Cell.IInteger 0 ]
    --         _ -> []
    -- in
    ( { model | inputs = Just (Array.fromList inputsList) }, cmd )


subscribe = \_ -> [ Mouse.moves Cell.MouseMove ]

