import { useCallback, useMemo, useState, useEffect } from "react"
import { VSCodeTextField, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"

import { inputEventTransform } from "../transforms"
import { cn } from "@/lib/utils"

type MiniMaxProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

const PRESET_URLS = [
	{ value: "https://api.minimax.io/anthropic", label: "api.minimax.io" },
	{ value: "https://api.minimaxi.com/anthropic", label: "api.minimaxi.com" },
]

export const MiniMax = ({ apiConfiguration, setApiConfigurationField }: MiniMaxProps) => {
	const { t } = useAppTranslation()

	// 判断当前 URL 是否是预设选项
	const isPresetUrl = useMemo(() => {
		const currentUrl = apiConfiguration.minimaxBaseUrl
		return PRESET_URLS.some((preset) => preset.value === currentUrl)
	}, [apiConfiguration.minimaxBaseUrl])

	// 状态：是否处于自定义模式
	const [isCustomMode, setIsCustomMode] = useState(!isPresetUrl)

	// 当 URL 改变时，更新自定义模式状态
	useEffect(() => {
		setIsCustomMode(!isPresetUrl)
	}, [isPresetUrl])

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	// 下拉框的值
	const dropdownValue = isCustomMode ? "custom" : apiConfiguration.minimaxBaseUrl || PRESET_URLS[0].value

	// 处理下拉框变化
	const handleDropdownChange = useCallback(
		(event: any) => {
			const target = event.target as HTMLSelectElement
			const value = target.value
			if (value === "custom") {
				setIsCustomMode(true)
			} else {
				setIsCustomMode(false)
				setApiConfigurationField("minimaxBaseUrl", value)
			}
		},
		[setApiConfigurationField],
	)

	return (
		<>
			<div>
				<label className="block font-medium mb-1">{t("settings:providers.minimaxBaseUrl")}</label>
				<VSCodeDropdown value={dropdownValue} onChange={handleDropdownChange} className={cn("w-full")}>
					{/* kilocode_change start: anthropic api */}
					{PRESET_URLS.map((preset) => (
						<VSCodeOption key={preset.value} value={preset.value} className="p-2">
							{preset.label}
						</VSCodeOption>
					))}
					<VSCodeOption value="custom" className="p-2">
						自定义
					</VSCodeOption>
					{/* kilocode_change end */}
				</VSCodeDropdown>
				{/* 当处于自定义模式时，显示输入框 */}
				{isCustomMode && (
					<VSCodeTextField
						value={apiConfiguration.minimaxBaseUrl || ""}
						onInput={handleInputChange("minimaxBaseUrl")}
						placeholder="https://api.example.com/anthropic"
						className="w-full mt-2"
					/>
				)}
			</div>
			<div>
				<VSCodeTextField
					value={apiConfiguration?.minimaxApiKey || ""}
					type="password"
					onInput={handleInputChange("minimaxApiKey")}
					placeholder={t("settings:placeholders.apiKey")}
					className="w-full">
					<label className="block font-medium mb-1">{t("settings:providers.minimaxApiKey")}</label>
				</VSCodeTextField>
				<div className="text-sm text-vscode-descriptionForeground">
					{t("settings:providers.apiKeyStorageNotice")}
				</div>
				{!apiConfiguration?.minimaxApiKey && (
					<VSCodeButtonLink
						href={
							// kilocode_change: anthropic api
							apiConfiguration.minimaxBaseUrl === "https://api.minimaxi.com/anthropic"
								? "https://platform.minimaxi.com/user-center/basic-information/interface-key"
								: "https://www.minimax.io/platform/user-center/basic-information/interface-key"
						}
						appearance="secondary">
						{t("settings:providers.getMiniMaxApiKey")}
					</VSCodeButtonLink>
				)}
			</div>
		</>
	)
}
