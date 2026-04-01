import { StyleSheet } from 'react-native'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: rawTokens.spacing4
  },
  imageContainer: {
    flexGrow: 1,
    padding: rawTokens.spacing16
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4
  },
  styledImage: {
    width: '100%'
  }
})
