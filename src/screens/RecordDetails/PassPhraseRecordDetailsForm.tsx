import { useEffect, useMemo } from 'react'

import { useLingui } from '@lingui/react/macro'
import { useNavigation } from '@react-navigation/native'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  AttachmentField,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { StyleSheet, View } from 'react-native'

import { PassPhrase } from '../../containers/PassPhrase'
import { useAutoLockContext } from '../../context/AutoLockContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useGetMultipleFiles } from '../../hooks/useGetMultipleFiles'
import { getMimeType } from '../../utils/getMimeType'
import { handleDownloadFile } from '../../utils/handleDownloadFile'
import { Attachment, CustomField, PassPhraseRecord } from './types'
import { toReadOnlyFieldProps } from './utils'

type ImagePreviewNavigation = {
  navigate: (
    screen: 'ImagePreview',
    params: { imageUri: string; imageName?: string }
  ) => void
}

interface PassPhraseRecordDetailsFormProps {
  initialRecord?: PassPhraseRecord
  selectedFolder?: string
}

interface PassPhraseRecordDetailsFormValues {
  title: string
  passPhrase: string
  note: string
  customFields: CustomField[]
  folder?: string
  attachments: Attachment[]
}

export const PassPhraseRecordDetailsForm = ({
  initialRecord,
  selectedFolder
}: PassPhraseRecordDetailsFormProps) => {
  const { t } = useLingui()
  const navigation = useNavigation() as ImagePreviewNavigation
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()
  const { setShouldBypassAutoLock } = useAutoLockContext() as {
    setShouldBypassAutoLock: (value: boolean) => void
  }

  const initialValues = useMemo<PassPhraseRecordDetailsFormValues>(
    () => ({
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      attachments: initialRecord?.attachments ?? []
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values, setValue } = useForm<PassPhraseRecordDetailsFormValues>({
    initialValues
  })

  useGetMultipleFiles({
    fieldNames: ['attachments'],
    updateValues: setValue,
    initialRecord
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const hasPassPhrase = !!values.passPhrase.length
  const hasNote = !!values.note.length
  const hasCustomFields = !!values.customFields.length
  const hasAttachments = !!values.attachments.length

  const handleAttachmentPress = async (attachment: Attachment) => {
    if (getMimeType(attachment.name ?? '').startsWith('image/')) {
      const imageUri = attachment.base64
        ? `data:image/jpeg;base64,${attachment.base64}`
        : ''

      navigation.navigate('ImagePreview', {
        imageUri,
        imageName: attachment.name
      })

      return
    }

    try {
      setShouldBypassAutoLock(true)
      await handleDownloadFile({
        base64: attachment.base64 ?? '',
        name: attachment.name ?? ''
      })
    } finally {
      setShouldBypassAutoLock(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        {hasPassPhrase && (
          <PassPhrase value={values.passPhrase} />
        )}

        {hasAttachments && (
          <MultiSlotInput testID="attachments-multi-slot-input">
            {values.attachments.map((attachment, index) => (
              <AttachmentField
                key={attachment?.id || attachment.name}
                label={t`Attachment`}
                value={attachment?.name ?? ''}
                isGrouped
                testID={`attachment-field-${index}`}
                onClick={() => {
                  void handleAttachmentPress(attachment)
                }}
              />
            ))}
          </MultiSlotInput>
        )}

        {(hasNote || hasCustomFields) && (
          <View style={styles.section}>
            <Text variant="caption" color={theme.colors.colorTextSecondary}>
              {t`Additional`}
            </Text>

            {hasNote && (
              <MultiSlotInput testID="comments-multi-slot-input">
                <InputField
                  label={t`Comment`}
                  placeholder={t`Enter Comment`}
                  readOnly
                  copyable
                  onCopy={copyToClipboard}
                  isGrouped
                  testID="comments-multi-slot-input-slot-0"
                  {...toReadOnlyFieldProps(register('note'))}
                />
              </MultiSlotInput>
            )}

            {hasCustomFields && (
              <MultiSlotInput testID="hidden-messages-multi-slot-input">
                {values.customFields.map((field, index) => (
                  <PasswordField
                    key={`${field.type}-${index}`}
                    label={t`Hidden Message`}
                    value={field.note ?? ''}
                    placeholder={t`Enter Hidden Message`}
                    readOnly
                    copyable
                    onCopy={copyToClipboard}
                    isGrouped
                    testID={`hidden-messages-multi-slot-input-slot-${index}`}
                  />
                ))}
              </MultiSlotInput>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  topContent: {
    gap: rawTokens.spacing8
  },
  section: {
    gap: rawTokens.spacing12
  }
})
