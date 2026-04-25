import type { ComponentType } from "react";
import Avatar from "@/components/avatar/Avatar";
import Button from "@/components/button/Button";
import Input from "@/components/input/Input";

type GenericComponent = ComponentType<Record<string, unknown>>;

export const AvatarAny = Avatar as unknown as GenericComponent;
export const ButtonAny = Button as unknown as GenericComponent;
export const InputAny = Input as unknown as GenericComponent;
