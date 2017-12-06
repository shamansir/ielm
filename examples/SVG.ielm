import Html exposing (Html)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Time exposing (Time, second)


view : Time -> Html msg
view model =
  let
    angle =
      turns (Time.inMinutes model)
    handX =
      toString (50 + 40 * cos angle)
    handY =
      toString (50 + 40 * sin angle)
  in
    svg [ viewBox "0 0 100 100", width "300px" ]
      [ circle [ cx "50", cy "50", r "45", fill "#0B79CE" ] []
      , line [ x1 "50", y1 "50", x2 handX, y2 handY, stroke "#023963" ] []
      ]


view 0


svg [ ]
    [ Svg.path [ d "M 25,100 C 25,150 75,150 75,100 S 100,25 150,75", stroke "#023963", fill "transparent", strokeWidth "5", transform "rotate(-30)" ] []
    ]


(\f -> view (f * 1000))
