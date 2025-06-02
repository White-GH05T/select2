import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "select2/dist/css/select2.min.css";
import "select2";

function Select2({
    id,
    placeholder,
    route,
    customPlaceHolder,
    value,
    onChange,
    ...props
}) {
    const selectRef = useRef();

    useEffect(() => {
        let $el = $(selectRef.current);
        let parent = $(document.body);

        if ($el.parents(".modal").length !== 0) {
            parent = $("#" + $el.parents(".modal").attr("id"));
        }

        let finalPlaceholder = placeholder;
        if (!finalPlaceholder) {
            finalPlaceholder = $el.closest(".form-group").find("label").text();
        } else if (customPlaceHolder) {
            finalPlaceholder = customPlaceHolder;
        }

        function select2CheckboxAdder(element) {
            if (
                $(".select2-container--open .select2-results__options[aria-multiselectable='true']").length === 1
            ) {
                $(".select2-container--open").addClass("multipleCheckbox");
            }
            return element.text;
        }

        if (route) {
            $.ajax({
                url: route,
                type: "GET",
                success: (response) => {
                    $el.html(null);
                    let option = new Option("", "", false, false);
                    $el.append(option);
                    $.map(response.response, function (item) {
                        let option = new Option(item.text, item.value, false, false);
                        for (let key of Object.keys(item)) {
                            if (key === "value") {
                                $(option).attr("value", item[key]);
                            } else if (key === "text") {
                                $(option).text(item[key]);
                            } else {
                                $(option).attr(`data-${key}`, item[key]);
                            }
                        }
                        $el.append(option);
                    });
                    $el
                        .select2({
                            width: "100%",
                            placeholder: finalPlaceholder,
                            dropdownParent: parent,
                            closeOnSelect: !$el.prop("multiple"),
                            allowClear: false,
                            templateResult: select2CheckboxAdder,
                        })
                        .on("change", (e) => {
                            if (onChange) onChange(e);
                        });
                    if (value !== undefined) {
                        $el.val(value).trigger("change");
                    }
                },
                error() {
                    $el
                        .select2({
                            width: "100%",
                            placeholder: finalPlaceholder,
                            dropdownParent: parent,
                            closeOnSelect: true,
                            allowClear: true,
                        })
                        .on("change", (e) => {
                            if (onChange) onChange(e);
                        });
                },
            });
        } else {
            $el
                .select2({
                    width: "100%",
                    placeholder: finalPlaceholder,
                    dropdownParent: parent,
                    closeOnSelect: false,
                    templateResult: select2CheckboxAdder,
                    allowClear: false,
                })
                .on("change", (e) => {
                    if (onChange) onChange(e);
                });
            if (value !== undefined) {
                $el.val(value).trigger("change");
            }
        }

        return () => {
            $el.select2("destroy");
        };
        // eslint-disable-next-line
    }, [route, placeholder, customPlaceHolder, value]);

    return (
        <select
            id={id}
            ref={selectRef}
            className="form-control select2"
            {...props}
        >
            {props.children}
        </select>
    );
}

export default Select2;