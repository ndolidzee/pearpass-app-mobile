import {
  Button,
  ContextMenu,
  InputField,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Close,
  MoreVert,
  TrashOutlined,
  Edit
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { View } from 'react-native'
import { styles } from './BottomSheetFileMoreActionsContentV2Styles'
import { useState } from 'react'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLingui } from '@lingui/react/macro'

const imageRegex = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|tiff?)$/i

interface BottomSheetFileMoreActionsContentV2Props {
  handleDelete: () => void
  handleRename: (newName: string) => void
  filename: string
}

export const BottomSheetFileMoreActionsContentV2 = ({
  handleDelete,
  handleRename,
  filename
}: BottomSheetFileMoreActionsContentV2Props) => {
  const [name, setName] = useState(filename)
  const [isRenaming, setIsRenaming] = useState(false)
  const { t } = useLingui()

  const isImage = imageRegex.test(filename)

  const { theme } = useTheme()
  const { dismiss } = useBottomSheetModal()
  const { bottom } = useSafeAreaInsets()

  return (
    <ContextMenu
      trigger={
        <Button
          variant="tertiary"
          size="medium"
          aria-label="More options"
          iconBefore={<MoreVert color={theme.colors.colorTextPrimary} />}
        />
      }
    >
      {isRenaming ? (
        <View style={[styles.container, { paddingBottom: bottom }]}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text variant="bodyEmphasized">
                {isImage ? t`Rename Image` : t`Rename File`}
              </Text>
            </View>
            <Button
              variant="tertiary"
              size="medium"
              aria-label="More options"
              iconBefore={<Close color={theme.colors.colorTextPrimary} />}
              onClick={() => setIsRenaming(false)}
            />
          </View>
          <View style={styles.content}>
            <InputField
              label={isImage ? t`Image Name` : t`File Name`}
              onChangeText={setName}
              value={name || ''}
            />
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                handleRename(name || '')
                setIsRenaming(false)
                dismiss()
              }}
            >
              {t`Save`}
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => setIsRenaming(false)}
            >
              {t`Discard`}
            </Button>
          </View>
        </View>
      ) : (
        <View style={{ paddingBottom: bottom }}>
          <NavbarListItem
            label="Rename"
            onClick={() => setIsRenaming(true)}
            icon={<Edit color={theme.colors.colorTextPrimary} />}
            showDivider
          />
          <NavbarListItem
            label="Delete"
            variant="destructive"
            onClick={() => {
              handleDelete()
              setIsRenaming(false)
              dismiss()
            }}
            icon={
              <TrashOutlined
                color={theme.colors.colorSurfaceDestructiveElevated}
              />
            }
            showDivider
          />
        </View>
      )}
    </ContextMenu>
  )
}
