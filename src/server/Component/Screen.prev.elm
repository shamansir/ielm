module Component.Screen exposing (..)

import Component.Cell as Cell

import Dict

type alias Time = Int
type alias CellId = Int
type alias InputId = Int

type Input
    = IInteger Int
    | IFloat Float
    | IText String

type CellKind = BasicCell | CellWithInputs | CellWith3D

type CellData = ATime Time | Inputs (Array Input)

type Msg
    = UpdateInput InputId Input
    | NewFrame Time

type alias Model =
    { currentCell: CellId
    , cellKind: CellKind
    , cellData: Maybe CellData
    }

type alias Flags = CellId

init : Flags -> Model
init flags =
    { currentCell = flags
    , cellKind = BasicCell
    , cellData = Nothing
    }

run : (CellId -> CellKind) ->

main =
    programWithFlags
        { init = \flags -> (flags, Cmd.none)
        , update = \_ model -> (model, Cmd.none)
        , subscriptions = \_ -> Sub.none
        , view = view
        }
