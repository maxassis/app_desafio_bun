import { BottomSheetView as GorhomBottomSheetView } from '@gorhom/bottom-sheet'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient'
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { withUniwind } from 'uniwind'

export const Image = withUniwind(ExpoImage)
export const LinearGradient = withUniwind(ExpoLinearGradient)
export const BottomSheetView = withUniwind(GorhomBottomSheetView)
export const KeyboardAwareScrollView = withUniwind(RNKeyboardAwareScrollView)
